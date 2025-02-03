/**
 * A map to associate cloud pulse service types with their corresponding labels.
 * Used for mapping service type identifiers (e.g., 'linode', 'dbaas') to their display labels.
 */

export const cloudPulseServicelMap: Map<string, string> = new Map([
  ['dbaas', 'dbaas'],
  ['linode', 'linode'],
]);
