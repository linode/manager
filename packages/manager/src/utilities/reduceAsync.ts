/**
 * reduceAsync
 *
 * This function is intended to be a replacement to Bluebird.reduce function.
 *
 * @param arr An array of items to be reduced
 * @param fn The async function that will be run for each element in the array
 * @param initialValue The initial value of the accumulator
 * @returns A Promise that resolves to the final reduced value after all asynchronous operations are completed
 */
export async function reduceAsync<T, R>(
  arr: T[],
  fn: (accumulator: R, current: T, index: number, array: T[]) => Promise<R>,
  initialValue: R
): Promise<R> {
  let accumulator = initialValue;

  for (let i = 0; i < arr.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    accumulator = await fn(accumulator, arr[i], i, arr);
  }

  return accumulator;
}
