import { Op } from 'sequelize'
import db from '../../../models'
import { logger } from '../../../lib/Logger'

//default interval is 10.5 to 12 minutes
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

  // safety clamp
  const minInterval = platformSensitivity * 90
  intervalSeconds = Math.max(intervalSeconds, minInterval)

  return new Date(Date.now() + intervalSeconds * 1000)
}

export default {
  name: 'Job Generator',
  schedule: '*/5 * * * * *', // Every 5 seconds
  handler: async () => {
    try {
      // Find the largest unit_id already scheduled, prevents re-scanning old subsales
      const lastJob = await db.Job.findOne({
        order: [['unit_id', 'DESC']],
        attributes: ['unit_id'],
      })

      const lastUnitId = lastJob?.unit_id || 0

      // Scan for new or updated property units (status 4 = success), id > last scheduled unit_id
      const subsales = await db.Subsale.findAll({
        where: {
          // status: 4, // previously is 4 as success
          status: 1,
          id: { [Op.gt]: lastUnitId },
        },
        // order: [['id', 'ASC']],
        order: [['id', 'DESC']],
        limit: 10,
        include: [
          {
            model: db.Agent,
            as: 'agent',
          },
        ],
      })

      if (!subsales.length) return

      // Cache portals map: id -> name, (platforms)
      const portals = await db.Portal.findAll({
        where: {
          status: true,
          portal_name:"PropertyGuru",
        },
      })

      if (!portals.length) return

      const portalMap = portals.reduce((acc, p) => {
        acc[p.id] = p.portal_name.toLowerCase()
        return acc
      }, {})

      //generate job

      for (const subsale of subsales) {
        const agent = subsale.agent
        if (!agent) continue

        for (const portalId in portalMap) {
          const portalName = portalMap[portalId]
          let platform = null

          if (portalName.includes('propertyguru')) platform = 'propertyguru'
          else if (portalName.includes('iproperty')) platform = 'iproperty'

          if (!platform) continue

          if(platform == 'iproperty') continue

          // Check daily limit for this platform (10 per day)
          const startOfDay = new Date()
          startOfDay.setHours(0, 0, 0, 0)

          const totalCount = await db.Job.count()
          const current_sequence_number = totalCount

          const todayJobCount = await db.Job.count({
            where: {
              agent_id: agent.id,
              platform,
              created_at: {
                [Op.gte]: startOfDay,
              },
            },
          })

          if (todayJobCount >= 10) {
            logger.info(
              `Daily limit reached for ${platform} (Agent ${agent.id}). Skipping unit ${subsale.id}`
            )
            continue
          }

          //check if credentials exist first
          const credential = await db.PortalCredential.findOne({
            where: {
              agent_id: agent.id,
              portal_id: portalId,
            },
          })

          if (!credential) {
            logger.info(
              `No Property Portal Account set up in Agent Portal:  ${platform} (Agent ${agent.id}). Skipping unit ${subsale.id}`
            )

            continue
          }

          if(!( subsale.property_portals.includes("1") || subsale.property_portals.includes("2") )) {
            continue
          }

          logger.info(
            `post to property poprtal:  ${subsale.property_portals} (Agent ${agent.id}). uni (${subsale.id})`
          )


          //prevent duplicate job
          const existingJob = await db.Job.findOne({
            where: {
              unit_id: subsale.id,
              agent_id: agent.id,
              platform,
              status: { [Op.notIn]: ['cancelled', 'failed'] },
            },
          })

          if (existingJob) continue

          // Get recent failures for this agent on this platform (last 24h)
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

          const platformSensitivity = 5 // Default sensitivity

          // last job trust score for this agent + platform.
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

          //create new job
          await db.Job.create({
            agent_id: agent.id,
            platform,
            portal_id: portalId,
            unit_id: subsale.id,
            status: 'pending',
            scheduled_at: scheduledAt,
            max_retries: 3,
            agent_trust_score: trustScore,
            platform_sensitivity_score: platformSensitivity,
            // property_portals
            post_to_propertyguru: subsale.property_portals.includes("1") ? 1 : 0,
            post_to_iproperty: subsale.property_portals.includes("2") ? 1 : 0,
            sequence_number: current_sequence_number,
          })
          logger.info(
            `Generated Job | unit=${subsale.id} agent=${agent.id} platform=${platform}`
          )
        }
      }
    } catch (error) {
      logger.error('Error in Job Generator:', error)
    }
  },
}
