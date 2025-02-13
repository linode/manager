import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';
import { randomItem } from 'support/util/random';
/**
 * Returns the id of a randomly selected oneClickApp
 * @returns number
 */
export function getRandomOCAId(): number {
  // pick a random app
  const appKeys = Object.keys(oneClickApps);
  const index = randomItem(appKeys);
  // id should be number, so "+" useful to coerce from string
  const id = +index;
  return id;
}
