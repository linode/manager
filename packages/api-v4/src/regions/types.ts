export type Capabilities =
  | 'Bare Metal'
  | 'Block Storage'
  | 'Cloud Firewall'
  | 'GPU Linodes'
  | 'Kubernetes'
  | 'Linodes'
  | 'Managed Databases'
  | 'Metadata'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Premium Plans'
  | 'Vlans'
  | 'VPCs';

export interface DNSResolvers {
  ipv4: string; // Comma-separated IP addresses
  ipv6: string; // Comma-separated IP addresses
}

export type RegionStatus = 'ok' | 'outage';

export interface Region {
  id: string;
  label: string;
  country: string;
  capabilities: Capabilities[];
  status: RegionStatus;
  resolvers: DNSResolvers;
}
