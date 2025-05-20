export type EntityType =
  | 'database'
  | 'domain'
  | 'firewall'
  | 'image'
  | 'linode'
  | 'longview'
  | 'nodebalancer'
  | 'stackscript'
  | 'volume'
  | 'vpc';

export interface AccountEntity {
  id: number;
  label: string;
  type: EntityType;
}
