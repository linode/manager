export type Capabilities =
  | 'Linodes'
  | 'NodeBalancers'
  | 'Block Storage'
  | 'Object Storage';

export interface Region {
  id: string;
  country: string;
  capabilities: Capabilities[];
}
