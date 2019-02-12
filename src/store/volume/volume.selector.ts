import { State } from './volume.reducer';

export const getVolumesForLinode = (state: State, linodeId: number) =>
  Object.values(state.itemsById).filter(
    ({ linode_id }) => linode_id && linode_id === linodeId
  );
