import * as Factory from 'factory.ts';
import { Domain, DomainRecord } from '@linode/api-v4/lib/domains/types';

export const domainFactory = Factory.Sync.makeFactory<Domain>({
  domain: Factory.each(id => `domain-${id}`),
  id: Factory.each(id => id),
  soa_email: 'admin@example.com',
  description: 'a domain',
  axfr_ips: [],
  ttl_sec: 1000,
  status: 'active',
  tags: [],
  group: '',
  master_ips: [],
  type: 'master',
  refresh_sec: 100,
  expire_sec: 100,
  retry_sec: 100,
  updated: '2020-01-01T13:00:00'
});

export const domainRecordFactory = Factory.Sync.makeFactory<DomainRecord>({
  id: Factory.each(id => id),
  type: 'A',
  name: 'www',
  target: '172.104.27.30',
  priority: 0,
  weight: 0,
  port: 0,
  service: null,
  protocol: null,
  ttl_sec: 0,
  tag: null,
  created: '2020-05-19T19:07:36',
  updated: '2020-05-19T19:07:36'
});
