import { logger } from '../../../lib/Logger'
import db from '../../../models'
import { Op } from 'sequelize'

export default {
  name: 'Timeout Monitor',
  schedule: '*/5 * * * * *', // every 5 seconds
  handler: async () => {
    try {
      const timeoutThreshold = new Date(Date.now() - 1 * 60 * 1000) // 15 min

      const stuckJobs = await db.Job.findAll({
        where: {
          status: 'in_progress',
          scheduled_at: { [Op.lte]: timeoutThreshold },
        },
        limit: 20,
        order: [['scheduled_at', 'ASC']],
        include: [
          {
            model: db.JobAttempt,
            as: 'attempts',
            where: { status: 'in_progress' },
            required: false, // We might find a job stuck in_progress without active attempt (rare but possible)
            limit: 1,
            order: [['id', 'DESC']],
          },
        ],
      })

      if (!stuckJobs.length) return

      logger.info(`Found ${stuckJobs.length} stuck jobs. Handling timeouts.`)

      await db.sequelize.transaction(async (t) => {
        for (const job of stuckJobs) {
          const activeAttempt = job.attempts?.[0]
          const currentRetries = job.retry_count || 0
          const maxRetries = job.max_retries || 3

          // Mark attempt as timeout
          if (activeAttempt) {
             await db.JobAttempt.update(
               {
                 status: 'timeout',
                 failure_reason: 'Job execution timed out (monitor)',
                 finished_at: new Date(),
               },
               { where: { id: activeAttempt.id }, transaction: t }
             )
          }

          // Update Job
          const updateData = {}
          if (currentRetries >= maxRetries) {
             updateData.status = 'failed'
             logger.info(`Job ${job.id} timed out and exhausted retries.`)
          } else {
             // Keep in_progress, schedule retry
             updateData.status = 'in_progress'
             updateData.scheduled_at = new Date(Date.now() + 60 * 1000)
             logger.info(`Job ${job.id} timed out. Scheduled for retry in 1m.`)
          }

          await job.update(updateData, { transaction: t })
        }
      })
    } catch (error) {
      logger.error('Error in Timeout Monitor:', error)
    }
  },
}
