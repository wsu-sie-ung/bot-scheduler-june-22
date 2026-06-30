// Single source of truth for when a job has run out of retries.
//
// Termination is gated on the JobAttempt.attempt_number (a real, persisted,
// monotonically increasing column) rather than a Job.retry_count field, which
// does not exist on the model and therefore never persisted.
//
// Semantics: `maxRetries` is the number of retries allowed *after* the first
// attempt. So a job may run a total of `maxRetries + 1` attempts (1 initial +
// maxRetries retries). `attemptNumber` is the 1-based number of the attempt
// that just completed; the job is exhausted once it reaches that total.

export function isRetryExhausted(attemptNumber, maxRetries) {
  const attempts = Number(attemptNumber) || 0
  const retries = Number(maxRetries) || 0
  return attempts >= retries + 1
}
