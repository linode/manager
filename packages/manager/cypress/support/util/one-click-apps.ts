import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';
import { decode } from 'he';

/**
 * Returns the id of a randomly selected oneClickApp
 * @returns number
 */
export function getRandomOCAId(): number {
  // pick a random app
  const appKeys = Object.keys(oneClickApps);
  const index = Math.floor(Math.random() * appKeys.length);
  // id should be number, so "+" useful to coerce from string
  const id = +appKeys[index];
  return id;
}

/**
 * Replaces the HTML entities such as &amp; and &reg; with the html character
 * This fn is the corollary to scripts/junit-summary/util/escape.ts which converts the html character to the html entity
 * *
 * @param str - string containing html entities
 *
 * @returns string
 */
export const replaceHTMLEntities = (str: string) => {
  return decode(str.replace('  ', ' '));
};
