import {
  CreateDomainPayload,
  Domain,
  DomainRecord,
  ZoneFile,
} from '@linode/api-v4/lib/domains/types';
import { Factory } from '@linode/utilities';

export const domainFactory = Factory.Sync.makeFactory<Domain>({
  axfr_ips: [],
  description: 'a domain',
  domain: Factory.each((id) => `domain-${id}`),
  expire_sec: 100,
  group: '',
  id: Factory.each((id) => id),
  master_ips: [],
  refresh_sec: 100,
  retry_sec: 100,
  soa_email: 'admin@example.com',
  status: 'active',
  tags: [],
  ttl_sec: 1000,
  type: 'master',
  updated: '2020-01-01T13:00:00',
});

export const domainRecordFactory = Factory.Sync.makeFactory<DomainRecord>({
  created: '2020-05-19T19:07:36',
  id: Factory.each((id) => id),
  name: 'www',
  port: 0,
  priority: 0,
  protocol: null,
  service: null,
  tag: null,
  target: '172.104.27.30',
  ttl_sec: 0,
  type: 'A',
  updated: '2020-05-19T19:07:36',
  weight: 0,
});

export const domainZoneFileFactory = Factory.Sync.makeFactory<ZoneFile>({
  zone_file: ['test line 1', 'test line 2'],
});

export const createDomainPayloadFactory = Factory.Sync.makeFactory<CreateDomainPayload>(
  {
    domain: Factory.each((id) => `domain-${id}`),
    type: 'master',
    master_ips: [],
    soa_email: 'admin@example.com',
    tags: [],
  }
);
