import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';

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
