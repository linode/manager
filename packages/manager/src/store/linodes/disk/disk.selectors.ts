import { State } from './disk.reducer';

export const getLinodeDisksForLinode = (state: State, linodeId: number) =>
  Object.values(state.itemsById).filter(
    ({ linode_id }) => linodeId === linodeId
  );
