// Default per-attempt execution budget, matching JobAttempt.execution_timeout_seconds.
export const DEFAULT_EXECUTION_TIMEOUT_SECONDS = 900 // 15 minutes

// A running attempt is "timed out" once it has been in flight longer than its
// configured execution budget. Pure and clock-injected so it can be tested
// deterministically.
//   startedAt               - JobAttempt.started_at (Date | string)
//   executionTimeoutSeconds - JobAttempt.execution_timeout_seconds (defaults to 900)
//   now                     - current time (Date)
export function isAttemptTimedOut(startedAt, executionTimeoutSeconds, now) {
  if (!startedAt) return false

  const startedMs = new Date(startedAt).getTime()
  if (Number.isNaN(startedMs)) return false

  const timeoutSeconds =
    Number(executionTimeoutSeconds) || DEFAULT_EXECUTION_TIMEOUT_SECONDS

  return now.getTime() - startedMs >= timeoutSeconds * 1000
}
