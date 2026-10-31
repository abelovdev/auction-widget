import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatCountdown, formatCurrency } from './formatters';

describe('formatCurrency', () => {
  it('formats numbers as USD currency', () => {
    expect(formatCurrency(50)).toBe('$50.00');
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });
});

describe('formatCountdown', () => {
  const NOW_TIMESTAMP = new Date('2026-05-25T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_TIMESTAMP);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "—" when date is missing or empty', () => {
    expect(formatCountdown(undefined)).toBe('—');
    expect(formatCountdown('')).toBe('—');
  });

  it('returns "Ended" when target time is invalid or in the past', () => {
    const pastDate = new Date(NOW_TIMESTAMP - 5000).toISOString();
    expect(formatCountdown(pastDate)).toBe('Ended');
    expect(formatCountdown('invalid-date')).toBe('Ended');
  });

  it('formats seconds correctly when remaining time is less than 1 minute', () => {
    const targetDate = new Date(NOW_TIMESTAMP + 45 * 1000).toISOString();
    expect(formatCountdown(targetDate)).toBe('45s');
  });

  it('formats minutes and seconds with leading zeros when remaining time is under 1 hour', () => {
    const targetDate = new Date(NOW_TIMESTAMP + (2 * 60 + 5) * 1000).toISOString();
    expect(formatCountdown(targetDate)).toBe('02m 05s');
  });

  it('formats days and hours when remaining time exceeds 24 hours', () => {
    const targetDate = new Date(NOW_TIMESTAMP + 27 * 3600 * 1000).toISOString();
    expect(formatCountdown(targetDate)).toBe('1d 3h');
  });
});
