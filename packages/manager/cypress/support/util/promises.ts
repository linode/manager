// Commenting out this file as it is not used in the project.
// and is giving "Unexpected `await` inside a loop" errors

// /**
//  * @file Utilities related to Promise handling.
//  */

// import { timeout } from './backoff';

// /**
//  * Resolves all of the given Promises in batches.
//  *
//  * @param promiseGenerators - Functions that return Promises to resolve.
//  * @param promisesPerPatch - How many Promises to attempt to resolve at once.
//  * @param delayMs - Time in milliseconds to wait between batches.
//  */
// export const resolveInBatches = async <T>(
//   promiseGenerators: (() => Promise<T>)[],
//   promisesPerBatch: number = 3,
//   delayMs: number = 1000
// ): Promise<T[]> => {
//   const results: T[] = [];
//   const unhandledPromises = [...promiseGenerators];
//   while (unhandledPromises.length >= promisesPerBatch) {
//     const batchGenerators = unhandledPromises.splice(0, promisesPerBatch);
//     results.push(
//       ...(await Promise.all(
//         batchGenerators.map((promiseGenerator) => promiseGenerator())
//       ))
//     );
//     if (unhandledPromises.length > 0) {
//       await timeout(delayMs);
//     }
//   }
//   // Resolve leftover promises.
//   if (unhandledPromises.length > 0) {
//     results.push(
//       ...(await Promise.all(
//         unhandledPromises.map((promiseGenerator) => promiseGenerator())
//       ))
//     );
//   }
//   return results;
// };
