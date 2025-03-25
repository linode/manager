export type EntityType =
  | 'linode'
  | 'firewall'
  | 'nodebalancer'
  | 'longview'
  | 'domain'
  | 'stackscript'
  | 'image'
  | 'volume'
  | 'database'
  | 'vpc';

export interface IamAccountEntities {
  data: AccountEntity[];
}

export interface AccountEntity {
  label: string;
  type: EntityType;
  id: number;
}
