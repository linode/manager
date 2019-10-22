import { Domain, DomainRecord } from 'linode-js-sdk/lib/domains';

export const domain1: Domain = {
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
  ttl_sec: 0
};

export const domain2: Domain = {
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
  ttl_sec: 0
};

export const domain3: Domain = {
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
  ttl_sec: 0
};

export const domains = [domain1, domain2, domain3];

export const domainRecord1: DomainRecord = {
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
  weight: 0
};

export const domainRecord2: DomainRecord = {
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
  weight: 0
};

export const domainRecord3: DomainRecord = {
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
  weight: 0
};

export const domainRecords = [domainRecord1, domainRecord2, domainRecord3];
