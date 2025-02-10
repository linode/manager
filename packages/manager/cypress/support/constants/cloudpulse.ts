/**
 * A map to associate cloud pulse service types with their corresponding labels.
 * Used for mapping service type identifiers (e.g., 'linode', 'dbaas') to their display labels.
 */

export const cloudPulseServiceMap: Record<string, string> = {
  dbaas: 'Databases',
  linode: 'Linode',
};
