import { DateTime } from 'luxon';

/**
 * Picks a random element from an array
 * @param items { T[] } an array of any kind
 * @returns {T} an element of the given type
 */
export const pickRandom = <T>(items: T[]): T => {
  // eslint-disable-next-line sonarjs/pseudo-random
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Generates a random date between two dates
 * @param start {Date} the start date
 * @param end {Date} the end date
 * @returns {Date} a random date between start and end
 */
export const randomDate = (
  start: Date = new Date(),
  end: Date = new Date(2021, 10, 25),
) =>
  DateTime.fromMillis(
    // eslint-disable-next-line sonarjs/pseudo-random
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
