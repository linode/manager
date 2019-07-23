import { State } from './linodeType.reducer';

export const getTypeById = (state: State, type: null | string) =>
  type ? state.entities.find(({ id }) => id === type) : undefined;
