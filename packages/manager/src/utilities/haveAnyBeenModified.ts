import { equals } from 'ramda';

let haveAnyBeenModified: <T>(objA: T, objB: T, keys: (keyof T)[]) => boolean;

haveAnyBeenModified = (state, nextState, keys) => {
  let idx = 0;
  const len = keys.length;

  while (idx < len) {
    const key = keys[idx];
    if (!equals(state[key], nextState[key])) {
      return true;
    }

    idx += 1;
  }
  return false;
};

export default haveAnyBeenModified;
