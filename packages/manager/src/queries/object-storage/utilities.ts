/**
 * Used to make a nice React Query queryKey by splitting the prefix
 * by the '/' character.
 *
 * By spreading the result, you can achieve a queryKey that is in the form of:
 * ["object-storage","us-southeast-1","test","testfolder"]
 *
 * @param {string} prefix The Object Stoage prefix path
 * @returns {string[]} a list of paths
 */
export const prefixToQueryKey = (prefix: string) => {
  return prefix.split('/', prefix.split('/').length - 1);
};
