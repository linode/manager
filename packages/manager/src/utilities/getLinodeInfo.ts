/**
 * getLinodeInfo
 *
 * Searches a list of Linodes by LinodeId and returns the full matching Linode
 * object, or undefined if no matching Linode is found.
 *
 * @param linodeId { number } The id of the Linode to retrieve information for.
 * @param linodes { array } An array of Linodes to search.
 */
const getLinodeInfo = (
  linodeId: number,
  linodes: Linode.Linode[]
): Linode.Linode | undefined => {
  if (!linodes) {
    throw new Error('You must provide a list of Linodes.');
  }
  return linodes.find((linode: Linode.Linode) => linode.id === linodeId);
};

export default getLinodeInfo;
