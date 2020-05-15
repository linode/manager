export type Capabilities =
  | 'Linodes'
  | 'NodeBalancers'
  | 'Block Storage'
  | 'Object Storage'
  | 'Kubernetes';

export type RegionStatus = 'ok' | 'outage';

export interface Region {
  id: string;
  country: string;
  capabilities: Capabilities[];
  status: RegionStatus;
}
