import {
  isAttemptTimedOut,
  DEFAULT_EXECUTION_TIMEOUT_SECONDS,
} from '../../services/cron/timeoutPolicy'

const at = (isoMinutesAgo, now) =>
  new Date(now.getTime() - isoMinutesAgo * 60 * 1000)

describe('timeoutPolicy', () => {
  const now = new Date('2026-06-30T12:00:00.000Z')

  it('exposes a 15-minute (900s) default', () => {
    expect(DEFAULT_EXECUTION_TIMEOUT_SECONDS).toBe(900)
  })

  describe('isAttemptTimedOut with the default 900s budget', () => {
    it('is not timed out at 5 minutes', () => {
      expect(isAttemptTimedOut(at(5, now), 900, now)).toBe(false)
    })

    it('is not timed out at 14 minutes', () => {
      expect(isAttemptTimedOut(at(14, now), 900, now)).toBe(false)
    })

    it('is timed out at 16 minutes', () => {
      expect(isAttemptTimedOut(at(16, now), 900, now)).toBe(true)
    })

    it('is timed out exactly at the 15-minute boundary', () => {
      expect(isAttemptTimedOut(at(15, now), 900, now)).toBe(true)
    })
  })

  describe('honors the per-attempt execution_timeout_seconds', () => {
    it('times out a short 60s budget after 2 minutes', () => {
      expect(isAttemptTimedOut(at(2, now), 60, now)).toBe(true)
    })

    it('does not time out a long 1800s budget at 20 minutes', () => {
      expect(isAttemptTimedOut(at(20, now), 1800, now)).toBe(false)
    })

    it('falls back to the 900s default when the budget is missing', () => {
      expect(isAttemptTimedOut(at(16, now), null, now)).toBe(true)
      expect(isAttemptTimedOut(at(5, now), undefined, now)).toBe(false)
    })
  })

  describe('guards against bad input', () => {
    it('never times out when startedAt is missing or invalid', () => {
      expect(isAttemptTimedOut(null, 900, now)).toBe(false)
      expect(isAttemptTimedOut(undefined, 900, now)).toBe(false)
      expect(isAttemptTimedOut('not-a-date', 900, now)).toBe(false)
    })
  })
})
