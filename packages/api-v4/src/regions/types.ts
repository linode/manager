export type Capabilities =
  | 'ACLP Logs Datacenter LKE-E'
  | 'Backups'
  | 'Bare Metal'
  | 'Block Storage'
  | 'Block Storage Encryption'
  | 'Block Storage Migrations'
  | 'Cloud Firewall'
  | 'Disk Encryption'
  | 'Distributed Plans'
  | 'GPU Linodes'
  | 'Kubernetes'
  | 'Kubernetes Enterprise'
  | 'LA Disk Encryption' // @TODO LDE: Remove once LDE is fully rolled out in every DC
  | 'Linode Interfaces'
  | 'Linodes'
  | 'Maintenance Policy'
  | 'Managed Databases'
  | 'Metadata'
  | 'NETINT Quadra T1U'
  | 'Network LoadBalancer'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Group'
  | 'Premium Plans'
  | 'StackScripts'
  | 'Vlans'
  | 'VPC Dual Stack'
  | 'VPCs';

export interface MonitoringCapabilities {
  alerts: Capabilities[];
  metrics: Capabilities[];
}

export interface DNSResolvers {
  ipv4: string; // Comma-separated IP addresses
  ipv6: string; // Comma-separated IP addresses
}

export type RegionStatus = 'ok' | 'outage';

export type RegionSite = 'core' | 'distributed';

export interface RegionAvailability {
  available: boolean;
  plan: string;
  region: string;
}

export interface RegionVPCAvailability {
  available: boolean; // True if Region has VPC capabilities
  available_ipv6_prefix_lengths: number[];
  region: string;
}

export type { Country, Region } from '@akamai/compute-ui-core/api';
