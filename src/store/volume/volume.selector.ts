export const getVolumesForLinode = (
  itemsById: Record<string, Linode.Volume>,
  linodeId: number
) =>
  Object.values(itemsById).filter(
    ({ linode_id }) => linode_id && linode_id === linodeId
  );
