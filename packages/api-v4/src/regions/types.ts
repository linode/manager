import { COUNTRY_CODE_TO_CONTINENT_CODE } from './constants';

export type Capabilities =
  | 'Backups'
  | 'Bare Metal'
  | 'Block Storage'
  | 'Block Storage Encryption'
  | 'Block Storage Migrations'
  | 'Cloud Firewall'
  | 'Disk Encryption'
  | 'Distributed Plans'
  | 'LA Disk Encryption' // @TODO LDE: Remove once LDE is fully rolled out in every DC
  | 'Linode Interfaces'
  | 'GPU Linodes'
  | 'Kubernetes'
  | 'Kubernetes Enterprise'
  | 'Linodes'
  | 'Maintenance Policy'
  | 'Managed Databases'
  | 'Metadata'
  | 'NodeBalancers'
  | 'NETINT Quadra T1U'
  | 'Object Storage'
  | 'Placement Group'
  | 'Premium Plans'
  | 'Vlans'
  | 'VPCs'
  | 'StackScripts';

export interface DNSResolvers {
  ipv4: string; // Comma-separated IP addresses
  ipv6: string; // Comma-separated IP addresses
}

export type RegionStatus = 'ok' | 'outage';

export type RegionSite = 'core' | 'distributed';

export interface Region {
  id: string;
  label: string;
  country: Country;
  capabilities: Capabilities[];
  placement_group_limits: {
    maximum_pgs_per_customer: number | null; // This value can be unlimited for some customers, for which the API returns the `null` value.
    maximum_linodes_per_pg: number;
  };
  status: RegionStatus;
  resolvers: DNSResolvers;
  site_type: RegionSite;
}

export interface RegionAvailability {
  available: boolean;
  plan: string;
  region: string;
}

type CountryCode = keyof typeof COUNTRY_CODE_TO_CONTINENT_CODE;

export type Country = Lowercase<CountryCode>;
