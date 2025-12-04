export type EntityType =
  | 'database'
  | 'domain'
  | 'firewall'
  | 'image'
  | 'linode'
  | 'lkecluster'
  | 'longview'
  | 'nodebalancer'
  | 'placement_group'
  | 'stackscript'
  | 'volume'
  | 'vpc';

export type EntityId = number | string;

export interface AccountEntity {
  id: EntityId;
  label: string;
  type: EntityType;
}
