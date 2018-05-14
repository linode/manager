namespace Linode {
  export interface Domain {
    id: number;
    domain: string;
    soa_email: string;
    description: string;
    refresh_sec: number;
    retry_sec: number;
    expire_sec: number;
    ttl_sec: number;
    status: DomainStatus;
    master_ips: string[];
    axfr_ips: string[];
    group: string;
    type: DomainType;
    zonefile: ZoneFile;
  }

  export type DomainStatus =
    'active'
    | 'disabled'
    | 'edit_mode';

  export type DomainType =
    'master'
    | 'slave';

  export type ZoneFile = {
    rendered: string,
    status:
    'current'
    | 'setting_up'
    | 'updating',
  };

  export type RecordType =
    'A' |
    'AAAA'|
    'CAA' |
    'CNAME' |
    'MX' |
    'NS' |
    'PTR' |
    'SRV' |
    'TXT';

  export interface Record {
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
    weight: number;
  }
}
