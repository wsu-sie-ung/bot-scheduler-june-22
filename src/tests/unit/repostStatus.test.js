import { isTerminalStatus } from '../../services/cron/repostStatus'

describe('isTerminalStatus', () => {
  it('treats success, failed, and cancelled as terminal', () => {
    expect(isTerminalStatus('success')).toBe(true)
    expect(isTerminalStatus('failed')).toBe(true)
    expect(isTerminalStatus('cancelled')).toBe(true)
  })

  it('treats in-flight states as non-terminal', () => {
    expect(isTerminalStatus('pending')).toBe(false)
    expect(isTerminalStatus('in_progress')).toBe(false)
    expect(isTerminalStatus('timeout')).toBe(false)
    expect(isTerminalStatus('cooldown')).toBe(false)
  })

  it('treats unknown / empty values as non-terminal', () => {
    expect(isTerminalStatus(undefined)).toBe(false)
    expect(isTerminalStatus(null)).toBe(false)
    expect(isTerminalStatus('')).toBe(false)
  })
})
