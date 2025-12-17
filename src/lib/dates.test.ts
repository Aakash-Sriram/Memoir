import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getToday,
  getYesterday,
  getTomorrow,
  parseDate,
  formatDateDisplay,
  isToday,
  DATE_FORMAT,
} from './dates.js';

describe('DATE_FORMAT', () => {
  it('should be yyyy-MM-dd format', () => {
    expect(DATE_FORMAT).toBe('yyyy-MM-dd');
  });
});

describe('getToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-17'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return current date in YYYY-MM-DD format', () => {
    expect(getToday()).toBe('2025-12-17');
  });
});

describe('getYesterday', () => {
  it('should return the previous day', () => {
    expect(getYesterday('2025-12-17')).toBe('2025-12-16');
  });

  it('should handle month boundaries', () => {
    expect(getYesterday('2025-12-01')).toBe('2025-11-30');
  });

  it('should handle year boundaries', () => {
    expect(getYesterday('2025-01-01')).toBe('2024-12-31');
  });
});

describe('getTomorrow', () => {
  it('should return the next day', () => {
    expect(getTomorrow('2025-12-17')).toBe('2025-12-18');
  });

  it('should handle month boundaries', () => {
    expect(getTomorrow('2025-11-30')).toBe('2025-12-01');
  });

  it('should handle year boundaries', () => {
    expect(getTomorrow('2024-12-31')).toBe('2025-01-01');
  });
});

describe('parseDate', () => {
  it('should parse YYYY-MM-DD format', () => {
    expect(parseDate('2025-12-17')).toBe('2025-12-17');
  });

  it('should parse MM/DD/YYYY format', () => {
    expect(parseDate('12/17/2025')).toBe('2025-12-17');
  });

  it('should return null for invalid dates', () => {
    expect(parseDate('not-a-date')).toBe(null);
  });

  it('should return null for empty string', () => {
    expect(parseDate('')).toBe(null);
  });
});

describe('formatDateDisplay', () => {
  it('should format date for human display', () => {
    const result = formatDateDisplay('2025-12-17');
    expect(result).toBe('Wednesday, December 17, 2025');
  });
});

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-17'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for today', () => {
    expect(isToday('2025-12-17')).toBe(true);
  });

  it('should return false for other dates', () => {
    expect(isToday('2025-12-16')).toBe(false);
    expect(isToday('2025-12-18')).toBe(false);
  });
});
