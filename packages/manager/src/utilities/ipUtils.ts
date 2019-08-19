/**
 * Removes the prefix length from the end of an IPv6 address.
 *
 * @param ip The IPv6 address to remove the prefix length from.
 */
export const removePrefixLength = (ip: string) => ip.replace(/\/\d+/, '');

/**
 * Regex for determining if a string is a private IP Addresses
 */
export const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
