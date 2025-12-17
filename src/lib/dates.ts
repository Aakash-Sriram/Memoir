// Date utilities using date-fns
import { format, addDays, subDays, parse, isValid } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';

// Get today's date in YYYY-MM-DD format
export function getToday(): string {
  return format(new Date(), DATE_FORMAT);
}

// Get yesterday relative to a date
export function getYesterday(date: string): string {
  const d = parse(date, DATE_FORMAT, new Date());
  return format(subDays(d, 1), DATE_FORMAT);
}

// Get tomorrow relative to a date
export function getTomorrow(date: string): string {
  const d = parse(date, DATE_FORMAT, new Date());
  return format(addDays(d, 1), DATE_FORMAT);
}

// Parse a date string, returns null if invalid
export function parseDate(input: string): string | null {
  // Try exact format first
  const parsed = parse(input, DATE_FORMAT, new Date());
  if (isValid(parsed)) {
    return format(parsed, DATE_FORMAT);
  }
  
  // Try common formats
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'MM-dd-yyyy',
    'dd/MM/yyyy',
    'MMM d, yyyy',
    'MMMM d, yyyy',
  ];
  
  for (const fmt of formats) {
    try {
      const p = parse(input, fmt, new Date());
      if (isValid(p)) {
        return format(p, DATE_FORMAT);
      }
    } catch {
      // Try next format
    }
  }
  
  return null;
}

// Format date for display
export function formatDateDisplay(date: string): string {
  const d = parse(date, DATE_FORMAT, new Date());
  return format(d, 'EEEE, MMMM d, yyyy');
}

// Check if date is today
export function isToday(date: string): boolean {
  return date === getToday();
}
