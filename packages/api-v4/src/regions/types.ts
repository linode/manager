import { COUNTRY_CODE_TO_CONTINENT_CODE } from './constants';

export type Capabilities =
  | 'Bare Metal'
  | 'Block Storage'
  | 'Block Storage Migrations'
  | 'Cloud Firewall'
  | 'Disk Encryption'
  | 'GPU Linodes'
  | 'Kubernetes'
  | 'Linodes'
  | 'Managed Databases'
  | 'Metadata'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Group'
  | 'Premium Plans'
  | 'Vlans'
  | 'VPCs';

export interface DNSResolvers {
  ipv4: string; // Comma-separated IP addresses
  ipv6: string; // Comma-separated IP addresses
}

export type RegionStatus = 'ok' | 'outage';

export type RegionSite = 'core' | 'distributed' | 'edge';

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
