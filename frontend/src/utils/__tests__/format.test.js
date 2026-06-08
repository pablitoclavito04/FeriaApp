import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, average } from '../format';

describe('formatPrice', () => {
  it('formats a number as euros', () => {
    // Spanish locale uses a comma decimal and a non-breaking space before €.
    expect(formatPrice(12.5)).toMatch(/12,50/);
    expect(formatPrice(12.5)).toMatch(/€/);
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toMatch(/0,00/);
  });

  it('returns a dash for non-numeric input', () => {
    expect(formatPrice('abc')).toBe('—');
    expect(formatPrice(NaN)).toBe('—');
    expect(formatPrice(undefined)).toBe('—');
  });

  it('accepts numeric strings', () => {
    expect(formatPrice('30')).toMatch(/30,00/);
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date in Spanish', () => {
    const out = formatDate('2026-06-06T00:00:00.000Z');
    expect(out).toMatch(/junio/);
    expect(out).toMatch(/2026/);
  });

  it('returns a dash for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDate('')).toBe('—');
  });
});

describe('average', () => {
  it('computes the mean of a list', () => {
    expect(average([10, 20, 30])).toBe(20);
    expect(average([5])).toBe(5);
  });

  it('returns 0 for an empty list', () => {
    expect(average([])).toBe(0);
  });

  it('coerces numeric strings', () => {
    expect(average(['10', '20'])).toBe(15);
  });
});
