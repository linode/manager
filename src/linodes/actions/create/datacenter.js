export const SELECT_DATACENTER = '@@linodes@@create/SELECT_DATACENTER';

export function selectDatacenter(datacenter) {
  return { type: SELECT_DATACENTER, datacenter };
}
