import { Op } from 'sequelize'
import db from '../../models'
import { logger } from '../../lib/Logger'

// A job is "terminal" once it can no longer transition on its own. These are the
// only states for which the originating RepostSubsale should be marked processed.
// (Our cron jobs only ever produce 'success' and 'failed'; 'cancelled' is listed
// for completeness in case a terminal job is observed with that status.)
const TERMINAL_STATUSES = ['success', 'failed', 'cancelled']

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status)
}

// Mark the RepostSubsale that spawned this job as 'processed' once the job has
// reached a terminal state. Safe to call from any job-status update:
//   - no-op when the job has no linked repost (repostSubsaleId falsy)
//   - no-op when the job status is not terminal (still pending/retrying/cooldown)
//   - idempotent: skips rows already 'processed'
export async function markRepostProcessedIfTerminal(
  repostSubsaleId,
  jobStatus,
  transaction
) {
  if (!repostSubsaleId || !isTerminalStatus(jobStatus)) return

  const [updated] = await db.RepostSubsale.update(
    { status: 'processed', processed_at: new Date() },
    {
      where: { id: repostSubsaleId, status: { [Op.ne]: 'processed' } },
      transaction,
    }
  )

  if (updated > 0) {
    logger.info(
      `RepostSubsale ${repostSubsaleId} marked processed (job status: ${jobStatus})`
    )
  }
}
