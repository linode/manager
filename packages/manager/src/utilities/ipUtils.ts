/**
 * Removes the prefix length from the end of an IPv6 address.
 *
 * @param ip The IPv6 address to remove the prefix length from.
 */
export const removePrefixLength = (ip: string) => ip.replace(/\/\d+/, '');
