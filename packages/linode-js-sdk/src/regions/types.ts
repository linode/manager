export type Capabilities =
  | 'Linodes'
  | 'NodeBalancers'
  | 'Block Storage'
  | 'Object Storage'
  | 'Kubernetes';

export interface Region {
  id: string;
  country: string;
  capabilities: Capabilities[];
}
