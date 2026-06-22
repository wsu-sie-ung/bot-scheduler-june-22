import { Op } from 'sequelize'
import db from '../../../models'
import { logger } from '../../../lib/Logger'

function computeNextRunAt({
  platformSensitivity,
  trustScore,
  recentFailures,
}) {
  const baseInterval = platformSensitivity * 120
  const agentModifier = (1 - trustScore) * 60
  const failurePenalty = recentFailures * 300
  const randomJitter = 30 + Math.random() * 90

  let intervalSeconds =
    baseInterval + agentModifier + failurePenalty + randomJitter

  const minInterval = platformSensitivity * 90
  intervalSeconds = Math.max(intervalSeconds, minInterval)

  return new Date(Date.now() + intervalSeconds * 1000)
}

export default {
  name: 'Repost Job Generator (Batch Safe)',
  schedule: '*/5 * * * * *',

  handler: async () => {
    let transaction

    try {
      transaction = await db.sequelize.transaction()

      // 🔒 STEP 1: CLAIM 10 ITEMS SAFELY
      const reposts = await db.RepostSubsale.findAll({
        where: {
          status: 'pending',
        },
        order: [['created_at', 'ASC']],
        limit: 10,
        lock: true,
        skipLocked: true,
        transaction,
      })

      if (!reposts.length) {
        await transaction.commit()
        return
      }

      const repostIds = reposts.map(r => r.id)

      // 🔒 Mark as in_progress immediately (atomic claim)
      await db.RepostSubsale.update(
        { status: 'in_progress' },
        {
          where: {
            id: repostIds,
          },
          transaction,
        }
      )

      await transaction.commit()

      // -----------------------------------
      // PROCESS OUTSIDE TRANSACTION
      // -----------------------------------

      const claimedReposts = await db.RepostSubsale.findAll({
        where: {
          id: repostIds,
        },
        include: [
          {
            model: db.Subsale,
            as: 'subsale',
            where: {
              status: 1, // select only Active
            },
            required: true,
            include: [
              {
                model: db.Agent,
                as: 'agent',
              },
            ],
          },
        ],
      })

      const portals = await db.Portal.findAll({
        where: {
          status: true,
          portal_name: 'PropertyGuru',
        },
      })

      if (!portals.length) return

      const portalMap = portals.reduce((acc, p) => {
        acc[p.id] = p.portal_name.toLowerCase()
        return acc
      }, {})

      for (const repost of claimedReposts) {
        const subsale = repost.subsale
        const agent = subsale?.agent


        if (!subsale || !agent) continue

        for (const portalId in portalMap) {
          const portalName = portalMap[portalId]

          let platform = null
          if (portalName.includes('propertyguru')) platform = 'propertyguru'
          else continue

          const credential = await db.PortalCredential.findOne({
            where: {
              agent_id: agent.id,
              portal_id: portalId,
            },
          })

          if (!credential) continue

          const existingJob = await db.Job.findOne({
            where: {
              unit_id: subsale.id,
              agent_id: agent.id,
              platform,
              status: { [Op.notIn]: ['cancelled', 'failed', 'deleted'] },
            },
          })

          if (existingJob) continue

          const recentFailures = await db.Job.count({
            where: {
              agent_id: agent.id,
              platform,
              status: 'failed',
              updated_at: {
                [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          })

          const platformSensitivity = 5

          const lastAgentJob = await db.Job.findOne({
            where: {
              agent_id: agent.id,
              platform,
            },
            order: [['created_at', 'DESC']],
            attributes: ['agent_trust_score'],
          })

          const trustScore = lastAgentJob?.agent_trust_score ?? 1.0

          const scheduledAt = computeNextRunAt({
            platformSensitivity,
            trustScore,
            recentFailures,
          })

          await db.Job.create({
            agent_id: agent.id,
            platform,
            portal_id: portalId,
            unit_id: subsale.id,
            repost_subsale_id: repost.id,
            status: 'pending',
            scheduled_at: scheduledAt,
            max_retries: 3,
            agent_trust_score: trustScore,
            platform_sensitivity_score: platformSensitivity,
            post_to_propertyguru: 1,
            post_to_iproperty: 0,
          })

          logger.info(
            `Batch Repost Job Generated | repost=${repost.id} unit=${subsale.id}`
          )
        }

        // await repost.update({
        //   status: 'processed',
        //   processed_at: new Date(),
        // })
      }
    } catch (error) {
      if (transaction) await transaction.rollback()
      logger.error('Error in Batch Repost Generator:', error)
    }
  },
}