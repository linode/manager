import { State } from './linodes.reducer';

export const findLinodeById = (state: State, linodeId: number) =>
  state.itemsById[linodeId];
