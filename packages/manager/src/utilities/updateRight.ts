/**
 * Allows for creation of state (right) while having the immutable context of the previous state (left).
 * These functions are generally used to create pipelines of updates where the context of the
 * original value/state is required for making decisions throughout the pipeline.
 *
 * @example
 *  updateRight((a, b) => a + b, [1, 2]) //-> [1, 3]
 *  updateRight((a, b) => a + b, [1, 3]) //-> [1, 4]
 *  updateRight((a, b) => a + b, [1, 4]) //-> [1, 5]
 *
 * Note how the right is updated with the value of fn(left, right), but the left is untouched.
 */
const updateRight = <Left = any, Right = any>(
  fn: (l: Left, r: Right) => Right
) => (arr: [Left, Right]) => [arr[0], fn(arr[0], arr[1])];

export default updateRight;
