import { logger } from '../../../lib/Logger'
import db from '../../../models'
import { Op } from 'sequelize'

export default {
  name: 'Retry Scheduler',
  schedule: '*/5 * * * * *', // Every 5 seconds
  handler: async () => {
    try {
      const now = new Date()

      // Include timeout/in_progress jobs so they can be retried
      const jobs = await db.Job.findAll({
        where: {
          status: { [Op.in]: ['pending', 'cooldown', 'timeout', 'in_progress'] },
          scheduled_at: { [Op.lte]: now },
        },
        limit: 20,
        order: [['scheduled_at', 'ASC']],
        include: [
          {
            model: db.JobAttempt,
            as: 'attempts',
            order: [['id', 'DESC']],
            limit: 1,
          },
        ],
      })

      if (!jobs.length) return

      for (const job of jobs) {
        // Skip if job is running (in_progress with active attempt)
        if (job.status === 'in_progress') {
            const latest = job.attempts?.[0]
            if (latest && latest.status === 'in_progress') continue
        }

        await db.sequelize.transaction(async (t) => {
          const latestAttempt = job.attempts?.[0]

          // First execution (no attempts yet)
          if (!latestAttempt) {
            await job.update(
              {
                status: 'pending',
                retry_count: 0,
              },
              { transaction: t }
            )
            logger.info(`RetryScheduler: Job ${job.id} is ready for first attempt`)
            return
          }

          // Retry limit reached
          if ((job.retry_count || 0) >= job.max_retries) {
            await job.update(
              {
                status: 'failed',
              },
              { transaction: t }
            )
            logger.info(`RetryScheduler: Job ${job.id} exhausted retries`)
            return
          }

          // Captcha detected -> apply cooldown (Only if not already in cooldown)
          if (latestAttempt.captcha_detected && job.status !== 'cooldown') {
            const cooldownDate = new Date(Date.now() + 6 * 60 * 60 * 1000) // 6h cooldown
            await job.update(
              {
                status: 'cooldown',
                cooldown_until: cooldownDate,
                scheduled_at: cooldownDate,
                retry_count: (job.retry_count || 0) + 1,
              },
              { transaction: t }
            )
            logger.info(`RetryScheduler: Job ${job.id} cooldown due to captcha`)
            return
          }

          // Ready for retry (Wait time passed)
          await job.update(
            {
              status: 'pending',
              scheduled_at: new Date(), // Run immediately
              retry_count: (job.retry_count || 0) + 1,
            },
            { transaction: t }
          )

          logger.info(`RetryScheduler: Job ${job.id} scheduled for retry now`)
        })
      }
    } catch (error) {
      logger.error('Error in Retry Scheduler:', error)
    }
  },
}
