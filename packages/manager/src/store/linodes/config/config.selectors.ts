import { State } from './config.reducer';

export const getLinodeConfigsForLinode = (
  { itemsById }: State,
  linodeId: number
) => Object.values(itemsById).filter(({ linode_id }) => linode_id === linodeId);
