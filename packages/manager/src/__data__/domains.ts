import type { Domain, DomainRecord } from '@linode/api-v4/lib/domains';

export const domain1: Domain = {
  axfr_ips: [],
  description: '',
  domain: 'domain1.com',
  expire_sec: 0,
  group: 'Production',
  id: 9999997,
  master_ips: [],
  refresh_sec: 0,
  retry_sec: 0,
  soa_email: 'user@host.com',
  status: 'active',
  tags: ['app'],
  ttl_sec: 0,
  type: 'master',
  updated: '2020-05-03 00:00:00',
};

export const domain2: Domain = {
  axfr_ips: [],
  description: '',
  domain: 'domain2.com',
  expire_sec: 0,
  group: '',
  id: 9999998,
  master_ips: [],
  refresh_sec: 0,
  retry_sec: 0,
  soa_email: 'user@host.com',
  status: 'active',
  tags: ['app2'],
  ttl_sec: 0,
  type: 'master',
  updated: '2020-05-02 00:00:00',
};

export const domain3: Domain = {
  axfr_ips: [],
  description: '',
  domain: 'domain3.com',
  expire_sec: 0,
  group: 'Production',
  id: 9999999,
  master_ips: [],
  refresh_sec: 0,
  retry_sec: 0,
  soa_email: 'user@host.com',
  status: 'active',
  tags: ['Production', 'app'],
  ttl_sec: 0,
  type: 'master',
  updated: '2020-05-01 00:00:00',
};

export const domains = [domain1, domain2, domain3];

export const domainRecord1: DomainRecord = {
  created: '2020-05-03 00:00:00',
  id: 12938697,
  name: 'www',
  port: 0,
  priority: 0,
  protocol: null,
  service: null,
  tag: null,
  target: 'www.example.com',
  ttl_sec: 0,
  type: 'CNAME',
  updated: '2020-05-03 00:00:00',
  weight: 0,
};

export const domainRecord2: DomainRecord = {
  created: '2020-05-03 00:00:00',
  id: 12938693,
  name: 'kibana',
  port: 0,
  priority: 0,
  protocol: null,
  service: null,
  tag: null,
  target: 'www.example.com',
  ttl_sec: 0,
  type: 'CNAME',
  updated: '2020-05-03 00:00:00',
  weight: 0,
};

export const domainRecord3: DomainRecord = {
  created: '2020-05-03 00:00:00',
  id: 22938693,
  name: 'host',
  port: 0,
  priority: 0,
  protocol: null,
  service: null,
  tag: null,
  target: 'www.example.com',
  ttl_sec: 0,
  type: 'AAAA',
  updated: '2020-05-03 00:00:00',
  weight: 0,
};

export const domainRecords = [domainRecord1, domainRecord2, domainRecord3];
