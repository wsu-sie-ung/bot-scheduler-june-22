import cron from 'node-cron'
import { logger } from '../../lib/Logger'
import jobs from './jobs'

const init = () => {
  logger.info('Initializing Cron Scheduler...')

  jobs.forEach((job) => {
    //loops thru all jobs
    if (!job.schedule || !job.handler) {
      logger.error(`Invalid job definition for ${job.name || 'unknown job'}`)
      return
    }

    logger.info(`Scheduling job: ${job.name} [${job.schedule}]`)

    cron.schedule(job.schedule, async () => {
      logger.info(`Starting job: ${job.name}`)
      try {
        await job.handler()
        logger.info(`Job finished: ${job.name}`)
      } catch (error) {
        logger.error(`Error in job ${job.name}: ${error.message}`)
        logger.error(error)
      }
    })
  })

  logger.info(`Cron Scheduler initialized with ${jobs.length} jobs.`) //logs the number of jobs scheduled
}

export default {
  //exporting scheduler
  init,
}
