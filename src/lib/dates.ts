// Slots are grouped and displayed in the venue's timezone so a day on the
// calendar matches the day the venue actually operates on.

export function dateKey(iso: string, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso));
}

// DayPicker works with local dates, so its days are keyed by their local calendar day
export function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function keyToLocalDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTimeRange(
  startIso: string,
  endIso: string,
  timeZone: string,
): string {
  return `${formatTime(startIso, timeZone)} – ${formatTime(endIso, timeZone)}`;
}

export function formatDate(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone,
    dateStyle: 'full',
  });
}

export function timeZoneAbbreviation(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(new Date(iso));
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
}
