/**
 * Core time utility handling secure timezone conversions 
 * from ISO 8601 timestamps to the user's local timezone, specifically Asia/Jakarta (WIB).
 */

const TIMEZONE = 'Asia/Jakarta';
const LOCALE = 'en-GB';

export function parseISODate(isoString: string | undefined | null): Date {
  if (!isoString) {
    throw new Error("Missing ISO date string from provider.");
  }
  
  const date = new Date(isoString);
  
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string provided: ${isoString}`);
  }
  
  return date;
}

export function formatEventDay(isoString: string): string {
  const date = parseISODate(isoString);
  return new Intl.DateTimeFormat(LOCALE, { 
    timeZone: TIMEZONE, 
    day: '2-digit' 
  }).format(date);
}

export function formatEventMonth(isoString: string): string {
  const date = parseISODate(isoString);
  return new Intl.DateTimeFormat(LOCALE, { 
    timeZone: TIMEZONE, 
    month: 'short' 
  }).format(date);
}

export function formatEventWeekday(isoString: string): string {
  const date = parseISODate(isoString);
  return new Intl.DateTimeFormat(LOCALE, { 
    timeZone: TIMEZONE, 
    weekday: 'long' 
  }).format(date);
}

export function formatEventTime(isoString: string): string {
  const date = parseISODate(isoString);
  // Ensure we get HH:mm format without AM/PM
  const timeStr = new Intl.DateTimeFormat(LOCALE, { 
    timeZone: TIMEZONE, 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  }).format(date);
  return timeStr;
}

export function formatEventDateShort(isoString: string): string {
  const date = parseISODate(isoString);
  return new Intl.DateTimeFormat(LOCALE, { 
    timeZone: TIMEZONE, 
    day: '2-digit', 
    month: 'short' 
  }).format(date);
}

// Explicit WIB formatters as requested
export function formatWIB(isoString: string): string {
  return `${formatEventTime(isoString)} WIB`;
}

export function formatWIBDate(isoString: string): string {
  return formatEventDateShort(isoString);
}

export function formatWIBDateTime(isoString: string): string {
  return `${formatWIBDate(isoString)} — ${formatWIB(isoString)}`;
}

export function formatRaceWeekendRange(sessions: { startDate: string, endDate: string }[]): string {
  if (!sessions || sessions.length === 0) return "TBD";
  
  const sorted = [...sessions].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  const firstSession = parseISODate(sorted[0].startDate);
  const lastSession = parseISODate(sorted[sorted.length - 1].startDate);
  
  const formatterDay = new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, day: 'numeric' });
  const formatterMonthLong = new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, month: 'long' });
  const formatterMonthShort = new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, month: 'short' });
  
  const firstDay = formatterDay.format(firstSession);
  const lastDay = formatterDay.format(lastSession);
  const lastMonth = formatterMonthLong.format(lastSession);
  
  // Check if they are in the same month (in WIB time)
  const firstMonthShort = formatterMonthShort.format(firstSession);
  const lastMonthShortCheck = formatterMonthShort.format(lastSession);
  
  if (firstMonthShort === lastMonthShortCheck) {
    return `${firstDay}-${lastDay} ${lastMonth}`;
  } else {
    return `${firstDay} ${firstMonthShort} - ${lastDay} ${lastMonth}`;
  }
}

/**
 * Calculates event status based purely on UTC timestamps.
 */
export function getSessionStatus(startDateISO: string, endDateISO: string, overrideStatus?: string): 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' {
  if (overrideStatus === 'POSTPONED' || overrideStatus === 'CANCELLED') {
    return overrideStatus as 'POSTPONED' | 'CANCELLED';
  }
  
  const now = Date.now();
  const start = new Date(startDateISO).getTime();
  const end = new Date(endDateISO).getTime();
  
  if (now > end) return 'FINISHED';
  if (now >= start && now <= end) return 'LIVE';
  return 'UPCOMING';
}
