import type { DomainRecord } from '@linode/api-v4';

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
