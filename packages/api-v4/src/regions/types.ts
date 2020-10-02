export type Capabilities =
  | 'Linodes'
  | 'NodeBalancers'
  | 'Block Storage'
  | 'Object Storage'
  | 'Kubernetes'
  | 'GPU Linodes'
  | 'Cloud Firewall'
  | 'Vlans';

export interface DNSResolvers {
  ipv4: string; // Comma-separated IP addresses
  ipv6: string; // Comma-separated IP addresses
}

export type RegionStatus = 'ok' | 'outage';

export interface Region {
  id: string;
  country: string;
  capabilities: Capabilities[];
  status: RegionStatus;
  resolvers: DNSResolvers;
}
