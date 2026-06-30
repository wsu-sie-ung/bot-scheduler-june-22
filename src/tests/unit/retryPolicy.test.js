import { isRetryExhausted } from '../../services/cron/retryPolicy'

describe('isRetryExhausted', () => {
  // Semantics: max_retries = N means 1 initial attempt + N retries = N + 1 total
  // attempts allowed. attemptNumber is the number of the attempt that just ran
  // (1-based). The job is exhausted once that count reaches N + 1.

  describe('with max_retries = 3 (4 attempts allowed)', () => {
    it('is not exhausted on the first attempt', () => {
      expect(isRetryExhausted(1, 3)).toBe(false)
    })

    it('is not exhausted on the 2nd or 3rd attempt (retries 1 and 2)', () => {
      expect(isRetryExhausted(2, 3)).toBe(false)
      expect(isRetryExhausted(3, 3)).toBe(false)
    })

    it('is exhausted on the 4th attempt (the 3rd and final retry)', () => {
      expect(isRetryExhausted(4, 3)).toBe(true)
    })

    it('is exhausted for any attempt beyond the 4th', () => {
      expect(isRetryExhausted(5, 3)).toBe(true)
    })
  })

  describe('with max_retries = 0 (no retries, 1 attempt allowed)', () => {
    it('is exhausted as soon as the first attempt completes', () => {
      expect(isRetryExhausted(1, 0)).toBe(true)
    })
  })

  describe('input coercion', () => {
    it('handles numeric strings from the database', () => {
      expect(isRetryExhausted('4', '3')).toBe(true)
      expect(isRetryExhausted('3', '3')).toBe(false)
    })
  })
})
