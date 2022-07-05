import { Volume } from '@linode/api-v4';

export const getVolumesForLinode = (
  itemsById: Record<string, Volume>,
  linodeId: number
) =>
  Object.values(itemsById).filter(
    ({ linode_id }) => linode_id && linode_id === linodeId
  );
