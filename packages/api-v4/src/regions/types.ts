export type Capabilities =
  | 'Linodes'
  | 'NodeBalancers'
  | 'Block Storage'
  | 'Object Storage'
  | 'Kubernetes'
  | 'GPU';

export type RegionStatus = 'ok' | 'outage';

export interface Region {
  id: string;
  country: string;
  capabilities: Capabilities[];
  status: RegionStatus;
}
