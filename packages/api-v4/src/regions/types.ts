import type { COUNTRY_CODE_TO_CONTINENT_CODE } from './constants';

export type Capabilities =
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

export interface Region {
  capabilities: Capabilities[];
  country: Country;
  id: string;
  label: string;
  /**
   * CloudPulse monitoring capabilities that are available in the region.
   *
   * **Upcoming Feature Notice:** this property may not be available to all customers
   * and may change in subsequent releases.
   */
  monitors?: MonitoringCapabilities;
  placement_group_limits: {
    maximum_linodes_per_pg: number;
    maximum_pgs_per_customer: null | number; // This value can be unlimited for some customers, for which the API returns the `null` value.
  };
  resolvers: DNSResolvers;
  site_type: RegionSite;
  status: RegionStatus;
}

export interface RegionAvailability {
  available: boolean;
  plan: string;
  region: string;
}

type CountryCode = keyof typeof COUNTRY_CODE_TO_CONTINENT_CODE;

export type Country = Lowercase<CountryCode>;
