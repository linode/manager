export const SELECT_SERVICE = '@@linodes@@create/SELECT_SERVICE';

export function selectService(service) {
  return { type: SELECT_SERVICE, service };
}
