// Pure helpers for occupied dates (browser-safe, testable). Dates are "YYYY-MM-DD".
export type Range = { check_in: string; check_out: string };

/** A day is occupied when it falls inside a booked range, check-in and check-out days included. */
export const isOccupied = (day: string, ranges: Range[]) =>
  ranges.some(r => day >= r.check_in && day <= r.check_out);

/** True when the stay [checkIn, checkOut] touches any occupied day. */
export const rangeHitsOccupied = (checkIn: string, checkOut: string, ranges: Range[]) =>
  ranges.some(r => checkIn <= r.check_out && checkOut >= r.check_in);

/** Admin overlap rule (same as the database constraint): stays overlap when one starts before the other ends. */
export const overlaps = (aIn: string, aOut: string, bIn: string, bOut: string) => aIn < bOut && aOut > bIn;
