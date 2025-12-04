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

export interface AccountEntity {
  id: number;
  label: string;
  type: EntityType;
}
