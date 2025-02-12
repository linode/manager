/**
 * Picks a random element from an array
 * @param items { T[] } an array of any kind
 * @returns {T} an element of the given type
 */
export const pickRandom = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Picks random elements from an array
 * @param items { T[] } an array of any kind
 * @param count { number } the number of elements to pick
 * @returns {T[]} an array of the given type
 */
export const pickXRandomFromArray = <T>(items: T[], count: number): T[] => {
  return items.sort(() => Math.random() - 0.5).slice(0, count);
};

/**
 * Generates a random date between two dates
 * @param start {Date} the start date
 * @param end {Date} the end date
 * @returns {Date} a random date between start and end
 */
export const randomDate = (
  start: Date = new Date(),
  end: Date = new Date(2021, 10, 25)
) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
