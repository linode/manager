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

  type DomainStatus =
    'active'
    | 'disabled'
    | 'edit_mode';

  type DomainType =
    'master'
    | 'slave';

  type ZoneFile = {
    rendered: string,
    status:
      'current'
      | 'setting_up'
      | 'updating',
  };
}
