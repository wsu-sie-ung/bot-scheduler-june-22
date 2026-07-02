import { Op, Transaction } from 'sequelize'
import db from '../../../models'
import { logger } from '../../../lib/Logger'
import config from '../../../config' // config.workerUrl → bot endpoint
import fetch from 'node-fetch'
import { decrypt } from '../../../lib/Encryption'
import { isRetryExhausted } from '../retryPolicy'
import { markRepostProcessedIfTerminal } from '../repostStatus'
import path from 'path'

const TRUST_SCORE = {
  MIN: 0.2,
  MAX: 1.0,
  SUCCESS_INC: 0.02,
  FAILURE_DEC: 0.05,
  CAPTCHA_DEC: 0.1,
}

function clampTrustScore(score) {
  return Math.min(TRUST_SCORE.MAX, Math.max(TRUST_SCORE.MIN, score))
}

export default {
  name: 'Job Dispatcher',
  schedule: '*/1 * * * * *', // Every 1 second
  handler: async () => {
    const now = new Date()

    try {
      // Limit concurrent jobs
      const runningJobsCount = await db.JobAttempt.count({
        where: { status: 'in_progress' },
      })
      if (runningJobsCount >= config.maxConcurrentJobs){
        console.log(`=====================> Ignore run because too many jobs in progress for now`);
        return;
      } 


      console.log(`=====================>check max Con Run Jobs number: ${config.maxConcurrentJobs} vs ${runningJobsCount}`);
      // return;

      // Fetch dispatchable jobs
      const jobs = await db.Job.findAll({
        where: {
          status: { [Op.or]: ['pending', 'cooldown'] }, // Dispatcher only picks pending/cooldown
          scheduled_at: { [Op.lte]: now },
        },
        order: [['scheduled_at', 'ASC']],
        limit: config.maxConcurrentJobs,
      })

      if (!jobs.length) return

      for (const job of jobs) {
        await db.sequelize.transaction(
          { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
          async (t) => {
            // Prevent double dispatch
            const activeAttempt = await db.JobAttempt.findOne({
              where: { job_id: job.id, status: 'in_progress' },
              transaction: t,
            })
            if (activeAttempt) return

            const lockedJob = await db.Job.findOne({
              where: { id: job.id, status: { [Op.or]: ['pending', 'cooldown'] } },
              lock: t.LOCK.UPDATE,
              transaction: t,
              include: [
                {
                  model: db.JobAttempt,
                  as: 'attempts',
                  order: [['id', 'DESC']],
                  limit: 1,
                },
              ],
            })
            if (!lockedJob) return

            const attemptNumber = lockedJob.attempts.length === 0 ? 1 : lockedJob.attempts[0].attempt_number + 1
            const browserProfilePath = path.join(`${job.platform}`, `user_${job.agent_id}`)

            // Create JobAttempt
            const attempt = await db.JobAttempt.create(
              {
                job_id: lockedJob.id,
                attempt_number: attemptNumber,
                status: 'in_progress',
                browser_profile_path: browserProfilePath,
                worker_id: '1',
                execution_id: `job-${lockedJob.id}-attempt-${attemptNumber}-${Date.now()}`,
                started_at: new Date(),
              },
              { transaction: t }
            )

            // Mark job as in_progress for dispatch
            await lockedJob.update({ status: 'in_progress' }, { transaction: t })

            // Fetch full unit details
            const unit = await db.Subsale.findByPk(lockedJob.unit_id, {
              attributes: { exclude: [] }, //fetch all columns from subsale 
              include: [ //for associations
                { model: db.Country, as: 'country' },
                { model: db.State, as: 'state' },
                { model: db.City, as: 'city' },

                {
                  model: db.PropertyType,
                  as: 'property_type', //subsale map here first then property_category
                  include: [
                    {
                      model: db.PropertyCategory,
                      as: 'property_category', //residential (1) / commercial (2)
                    },
                  ],
                },

                { model: db.SubsaleContent, as: 'contents' }, //for images 
                { model: db.SubsaleDescription, as: 'descriptions' },
                { model: db.SubsaleFurnishList, as: 'furnish_list' },
                { model: db.SubsaleRoom, as: 'rooms' }, //for bedroom & bathroom count
              ],
              transaction: t,
            })
            if (!unit) throw new Error(`Unit ${lockedJob.unit_id} not found`)

            // Fetch portal & credentials
            const portal = await db.Portal.findOne({
              where: { portal_name: lockedJob.platform },
              transaction: t,
            })
            if (!portal) throw new Error(`Portal ${lockedJob.platform} not found`)

            const credential = await db.PortalCredential.findOne({
              where: { agent_id: lockedJob.agent_id, portal_id: portal.id },
              transaction: t,
            })
            if (!credential) throw new Error(`No credentials found for Agent ${lockedJob.agent_id} on ${lockedJob.platform}`)

            const password = decrypt(credential.password)

            const payload = {
              jobId: String(lockedJob.id),
              agentId: String(lockedJob.agent_id),
              platform: lockedJob.platform,
              email: credential.username,
              password: password,
              unitInfo: unit.toJSON(),
              browserProfilePath: browserProfilePath,
              post_to_propertyguru: job.post_to_propertyguru,
              post_to_iproperty: job.post_to_iproperty,
              jobAttemptId: attempt.id,
            }

            // Trigger worker
            setImmediate(async () => {
              try {
                if (!config.workerUrl) throw new Error('Worker URL is not configured')

                console.log("wodker " + config.workerUrl);

                // console.log(JSON.stringify(payload))

                // const response = await fetch(config.workerUrl, {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(payload),
                // })

                const response = await fetch(config.workerUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0',
                  },
                  body: JSON.stringify(payload),
                })
                const responseClone = response.clone();



                if (!response.ok) throw new Error(`Worker returned ${response.status} ${response.statusText}`)
                const result = await response.json()
                const textResult = await responseClone.text();
                console.log(`=====>${textResult}<=====`);

                const { status, captchaDetected, error } = result

                // Update JobAttempt & Job
                await db.sequelize.transaction(async (t2) => {
                  const finishedAt = new Date()

                  // Update Attempt Status
                  await db.JobAttempt.update(
                    {
                      status: status === 'success' ? 'success' : 'failed',
                      captcha_detected: captchaDetected || false,
                      failure_reason: error || null,
                      finished_at: finishedAt,
                    },
                    { where: { id: attempt.id }, transaction: t2 }
                  )

                  // Calculate Trust Score
                  let nextTrust = lockedJob.agent_trust_score
                  if (status === 'success') nextTrust = clampTrustScore(nextTrust + TRUST_SCORE.SUCCESS_INC)
                  else if (captchaDetected === true) nextTrust = clampTrustScore(nextTrust - TRUST_SCORE.CAPTCHA_DEC)
                  else nextTrust = clampTrustScore(nextTrust - TRUST_SCORE.FAILURE_DEC)

                  // Update Job Status based on outcome
                  const updateData = { agent_trust_score: nextTrust }

                  if (status === 'success') {
                    updateData.status = 'success'
                    updateData.completed_at = finishedAt
                  } else if (captchaDetected) {
                    const cooldownDate = new Date(Date.now() + 6 * 60 * 60 * 1000)
                    updateData.status = 'cooldown'
                    updateData.cooldown_until = cooldownDate
                    updateData.scheduled_at = cooldownDate
                    // Captcha pauses the job for a 6h cooldown. Each re-dispatch
                    // creates a new JobAttempt (incrementing attempt_number), so
                    // RetryScheduler will mark the job 'failed' via isRetryExhausted
                    // once the attempts are exhausted.
                  } else {
                    // Normal Failure
                    if (isRetryExhausted(attemptNumber, lockedJob.max_retries)) {
                      updateData.status = 'failed'
                    } else {
                      // Retry (Error) -> Keep in_progress, schedule for +1m
                      updateData.status = 'in_progress'
                      updateData.scheduled_at = new Date(Date.now() + 60 * 1000)
                    }
                  }

                  await db.Job.update(
                    updateData,
                    { where: { id: lockedJob.id }, transaction: t2 }
                  )

                  // If this outcome is terminal, close out the originating repost.
                  await markRepostProcessedIfTerminal(
                    lockedJob.repost_subsale_id,
                    updateData.status,
                    t2
                  )
                })

                logger.info(`Worker finished Job ${lockedJob.id}, Status: ${status}`)
              } catch (err) {
                logger.error(`Failed to call worker for Job ${lockedJob.id}`, err)

                const isTimeout = err.name === 'AbortError'
                const status = isTimeout ? 'timeout' : 'failed'
                const failureReason = isTimeout ? 'Worker execution timed out' : err.message

                // Update JobAttempt & Job
                try {
                  await db.sequelize.transaction(async (t3) => {
                    const nextTrust = clampTrustScore(parseFloat(lockedJob.agent_trust_score) - TRUST_SCORE.FAILURE_DEC)
                    const finishedAt = new Date()

                    await db.JobAttempt.update(
                      {
                        status,
                        failure_reason: failureReason,
                        finished_at: finishedAt,
                      },
                      { where: { id: attempt.id }, transaction: t3 }
                    )

                    const updateData = { agent_trust_score: nextTrust }

                    if (isRetryExhausted(attemptNumber, lockedJob.max_retries)) {
                      updateData.status = 'failed'
                    } else {
                      // Retry (Timeout/Error) -> Keep in_progress, schedule for +1m
                      updateData.status = 'in_progress'
                      updateData.scheduled_at = new Date(Date.now() + 60 * 1000)
                    }

                    await db.Job.update(
                      updateData,
                      { where: { id: lockedJob.id }, transaction: t3 }
                    )

                    // If this outcome is terminal, close out the originating repost.
                    await markRepostProcessedIfTerminal(
                      lockedJob.repost_subsale_id,
                      updateData.status,
                      t3
                    )
                  })
                } catch (dbErr) {
                  logger.error('Failed to update job status after worker failure', dbErr)
                }
              }
            })
          }
        )
      }
    } catch (error) {
      logger.error('Dispatcher failed:', error)
    }
  },
}
