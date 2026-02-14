export const PACIFIC_TIME_ZONE = "America/Los_Angeles";

function toDateParts(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function pacificDateKeyFromParts(year: number, monthZeroBased: number, day: number) {
  return `${year}-${pad2(monthZeroBased + 1)}-${pad2(day)}`;
}

export function toPacificDateKey(input: Date | string | number) {
  const parts = toDateParts(input);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function getPacificYearMonth(input: Date | string | number) {
  const parts = toDateParts(input);
  return {
    year: parts.year,
    monthZeroBased: parts.month - 1,
  };
}

export function formatPacificDate(
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
) {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    ...options,
  });
}

export function formatPacificTime(
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
) {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleTimeString("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    ...options,
  });
}

export function formatPacificDateTimeLocalValue(input: Date | string | number) {
  const parts = toDateParts(input);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const asUtcMs = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second")
  );

  return (asUtcMs - date.getTime()) / 60000;
}

export function parsePacificDateTimeLocal(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return new Date(value);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  const baseUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utcMs = baseUtcMs;

  for (let i = 0; i < 2; i++) {
    const offsetMinutes = getTimeZoneOffsetMinutes(PACIFIC_TIME_ZONE, new Date(utcMs));
    utcMs = baseUtcMs - offsetMinutes * 60_000;
  }

  return new Date(utcMs);
}
