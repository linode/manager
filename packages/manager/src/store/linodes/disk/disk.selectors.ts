import { State } from './disk.reducer';

export const getLinodeDisksForLinode = (state: State, linodeId: number) => {
  // Safe access of `itemsById` is necessary here, even though TypeScript will
  // not complain about omitting the "?". The reason is that `state[linodeId]`
  // could still be `undefined`.
  const itemsById = state[linodeId]?.itemsById ?? {};

  return Object.values(itemsById);
};
