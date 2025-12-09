export interface Domain {
  axfr_ips: string[];
  description: string;
  domain: string;
  expire_sec: number;
  group: string;
  id: number;
  master_ips: string[];
  refresh_sec: number;
  retry_sec: number;
  soa_email: string;
  status: DomainStatus;
  tags: string[];
  ttl_sec: number;
  type: DomainType;
  updated: string;
}

export interface CloneDomainPayload {
  domain: string;
}

export interface ImportZonePayload {
  domain: string;
  remote_nameserver: string;
}

export type ZoneFile = {
  zone_file: string[];
};

export type DomainStatus = 'active' | 'disabled' | 'edit_mode' | 'has_errors';

export type DomainType = 'master' | 'slave';

export type RecordType =
  | 'A'
  | 'AAAA'
  | 'CAA'
  | 'CNAME'
  | 'MX'
  | 'NS'
  | 'PTR'
  | 'SRV'
  | 'TXT';

export interface DomainRecord {
  created: string;
  id: number;
  name: string;
  port: number;
  priority: number;
  protocol: null | string;
  service: null | string;
  tag: null | string;
  target: string;
  ttl_sec: number;
  type: RecordType;
  updated: string;
  weight: number;
}

export interface CreateDomainPayload {
  domain: string;
  master_ips?: string[];
  soa_email?: string;
  tags?: string[];
  type: DomainType;
}
export interface UpdateDomainPayload {
  axfr_ips?: string[];
  description?: string;
  domain?: string;
  expire_sec?: number;
  group?: string;
  master_ips?: string[];
  refresh_sec?: number;
  retry_sec?: number;
  soa_email?: string;
  status?: DomainStatus;
  tags?: string[];
  ttl_sec?: number;
}
