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
  label: string;
  type: EntityType;
  id: number;
}
