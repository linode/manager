import { init, keys, map } from 'ramda';

// Recursively applies Ramda's `init` function to every array found in the input.
// I.e. initAll({ x: { y: [1, 2] }} ) == { x: { y: [1] } }
export const initAll = (element: any): any => {
  if (Array.isArray(element)) {
    return init(element);
    // Check for length of Object.keys, because Dates and null are objects too
  } else if (typeof element === 'object' && keys(element).length > 0) {
    return map(initAll, element);
  }
  return element;
};
