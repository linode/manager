export type EntityType =
  | 'database'
  | 'domain'
  | 'firewall'
  | 'image'
  | 'linode'
  | 'lkecluster'
  | 'longview'
  | 'mysql_database'
  | 'nodebalancer'
  | 'placement_group'
  | 'postgresql_database'
  | 'stackscript'
  | 'valkey_database'
  | 'volume'
  | 'vpc';

export interface AccountEntity {
  id: number;
  label: string;
  type: EntityType;
}
