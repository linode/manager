import * as Factory from 'factory.ts';
import { Domain } from 'linode-js-sdk/lib/domains/types';

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
  retry_sec: 100
});
