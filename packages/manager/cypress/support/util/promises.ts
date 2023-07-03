/**
 * @file Utilities related to Promise handling.
 */

import { timeout } from './backoff';

/**
 * Resolves all of the given Promises in batches.
 *
 * @param promises - Promises to resolve.
 * @param promisesPerPatch - How many Promises to attempt to resolve at once.
 * @param delayMs - Time in milliseconds to wait between batches.
 */
export const resolveInBatches = async <T>(
  promises: Promise<T>[],
  promisesPerBatch: number = 3,
  delayMs: number = 1000): Promise<T[]> => {
    let results: T[] = [];
    const unhandledPromises = [...promises];
    console.log('a...');
    while (unhandledPromises.length >= promisesPerBatch) {
      console.log('b...');
      const batchPromises = unhandledPromises.splice(0, promisesPerBatch);
      console.log({promiseLength: batchPromises.length});
      results.push(...await Promise.all(batchPromises));
      if (unhandledPromises.length > 0) {
        console.log('timin out bro');
        await timeout(delayMs);
      }
    }
    console.log('c...');
    // Resolve leftover promises.
    if (unhandledPromises.length > 0) {
      results.push(...await Promise.all(promises));
    }
    console.log('d...');
    return results;
}
