import type { DriveEvent } from "@/content/types";

/** Mongolia keeps UTC+8 all year (no daylight saving since 2017). */
const ULAANBAATAR = "+08:00";

export type EventState = "upcoming" | "live" | "completed";

/** Where an event stands at `now`, judged by its days in Ulaanbaatar. */
export function eventState(event: Pick<DriveEvent, "days">, now: Date = new Date()): EventState {
  const start = Date.parse(`${event.days[0]}T00:00:00${ULAANBAATAR}`);
  const end = Date.parse(`${event.days[1]}T23:59:59.999${ULAANBAATAR}`);
  const t = now.getTime();
  if (t > end) return "completed";
  return t >= start ? "live" : "upcoming";
}

/** Registration shows only for an event that has not ended and has a verified link. */
export function registrationOpen(event: Pick<DriveEvent, "days" | "registrationUrl">, now: Date = new Date()): boolean {
  return Boolean(event.registrationUrl) && eventState(event, now) !== "completed";
}

/** "2026.08.22" or "2026.10.09–10": the house style of the event posters, in either language. */
export function eventDays(event: Pick<DriveEvent, "days">): string {
  const [first, last] = event.days.map((day) => day.replaceAll("-", "."));
  if (first === last) return first;
  return first.slice(0, 8) === last.slice(0, 8) ? `${first}–${last.slice(8)}` : `${first}–${last}`;
}
