/**
 * Returns true if the end time is the same day (within 24 hours)
 * as the start time, false otherwise. Padded to 25 hours to err
 * on the side of caution.
 * @param start Start time (must be seconds, not ms)
 * @param end End time (must be seconds, not ms)
 */
export const isToday = (start: number, end: number) =>
  end - start < 60 * 60 * 25;
