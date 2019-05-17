export const domain1: Linode.Domain = {
  master_ips: [],
  domain: 'domain1.com',
  expire_sec: 0,
  group: 'Production',
  axfr_ips: [],
  refresh_sec: 0,
  id: 9999997,
  description: '',
  type: 'master',
  tags: ['app'],
  retry_sec: 0,
  soa_email: 'user@host.com',
  status: 'active',
  ttl_sec: 0,
  zonefile: { rendered: '', status: 'current' }
};

export const domain2: Linode.Domain = {
  master_ips: [],
  domain: 'domain2.com',
  expire_sec: 0,
  group: '',
  axfr_ips: [],
  refresh_sec: 0,
  id: 9999998,
  description: '',
  type: 'master',
  tags: ['app2'],
  retry_sec: 0,
  soa_email: 'user@host.com',
  status: 'active',
  ttl_sec: 0,
  zonefile: { rendered: '', status: 'current' }
};

export const domain3: Linode.Domain = {
  master_ips: [],
  domain: 'domain3.com',
  expire_sec: 0,
  group: 'Production',
  axfr_ips: [],
  refresh_sec: 0,
  id: 9999999,
  description: '',
  type: 'master',
  tags: ['Production', 'app'],
  retry_sec: 0,
  soa_email: 'user@host.com',
  status: 'active',
  ttl_sec: 0,
  zonefile: { rendered: '', status: 'current' }
};

export const domains = [domain1, domain2, domain3];
