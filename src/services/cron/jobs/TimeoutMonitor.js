import { logger } from '../../../lib/Logger'
import db from '../../../models'
import { isRetryExhausted } from '../retryPolicy'
import { markRepostProcessedIfTerminal } from '../repostStatus'
import { isAttemptTimedOut } from '../timeoutPolicy'

export default {
  name: 'Timeout Monitor',
  schedule: '*/5 * * * * *', // every 5 seconds
  handler: async () => {
    try {
      const now = new Date()

      // Only jobs with a currently-running attempt are candidates. A job sitting
      // in_progress while waiting to be retried has no active attempt (its latest
      // attempt is failed/timeout) and a future scheduled_at, so it is correctly
      // left for the RetryScheduler rather than reaped here.
      const inProgressJobs = await db.Job.findAll({
        where: { status: 'in_progress' },
        limit: 50,
        order: [['scheduled_at', 'ASC']],
        include: [
          {
            model: db.JobAttempt,
            as: 'attempts',
            where: { status: 'in_progress' },
            required: true,
            limit: 1,
            order: [['id', 'DESC']],
          },
        ],
      })

      // A job is stuck once its active attempt has run longer than its execution
      // budget (JobAttempt.execution_timeout_seconds, default 900s / 15 min).
      const stuckJobs = inProgressJobs.filter((job) => {
        console.log(job)
        isAttemptTimedOut(
          job.attempts[0].started_at,
          job.attempts[0].execution_timeout_seconds,
          now
        )
      }
      )

      if (!stuckJobs.length) return

      logger.info(`Found ${stuckJobs.length} stuck jobs. Handling timeouts.`)

      await db.sequelize.transaction(async (t) => {
        for (const job of stuckJobs) {
          const activeAttempt = job.attempts[0]

          // Mark the running attempt as timed out.
          await db.JobAttempt.update(
            {
              status: 'timeout',
              failure_reason: 'Job execution timed out (monitor)',
              finished_at: new Date(),
            },
            { where: { id: activeAttempt.id }, transaction: t }
          )

          // Retry unless the attempts are exhausted.
          const updateData = {}
          if (isRetryExhausted(activeAttempt.attempt_number, job.max_retries)) {
            updateData.status = 'failed'
            logger.info(`Job ${job.id} timed out and exhausted retries.`)
          } else {
            updateData.status = 'in_progress'
            updateData.scheduled_at = new Date(Date.now() + 60 * 1000)
            logger.info(`Job ${job.id} timed out. Scheduled for retry in 1m.`)
          }

          await job.update(updateData, { transaction: t })

          // If the timeout exhausted retries, close out the originating repost.
          await markRepostProcessedIfTerminal(
            job.repost_subsale_id,
            updateData.status,
            t
          )
        }
      })
    } catch (error) {
      logger.error('Error in Timeout Monitor:', error)
    }
  },
}
