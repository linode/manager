import * as Factory from 'factory.ts';
import {
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedServiceMonitor,
  ManagedStatsData,
} from '@linode/api-v4/lib/managed/types';

export const contactFactory = Factory.Sync.makeFactory<ManagedContact>({
  email: 'john.doe@example.com',
  group: 'on-call',
  id: Factory.each((i) => i),
  name: 'John Doe',
  phone: {
    primary: '555-555-5555',
    secondary: null,
  },
  updated: '2019-08-01T20:29:14',
});

export const credentialFactory = Factory.Sync.makeFactory<ManagedCredential>({
  id: Factory.each((i) => i),
  last_decrypted: '2019-07-01',
  label: 'credential-1',
});

export const issueFactory = Factory.Sync.makeFactory<ManagedIssue>({
  id: Factory.each((i) => i),
  services: Factory.each((i) => [i]),
  created: '2019-08-01T20:29:14',
  entity: {
    id: Factory.each((i) => i),
    label: Factory.each((i) => `Managed issue #${i}`),
    type: 'ticket',
    url: Factory.each((i) => `/support/tickets/${i}`),
  },
});

export const monitorFactory = Factory.Sync.makeFactory<ManagedServiceMonitor>({
  consultation_group: '',
  timeout: 10,
  label: 'Test service',
  created: '2019-08-01T20:29:14',
  status: 'pending',
  region: null,
  updated: '2019-08-01T20:31:19',
  service_type: 'url',
  notes: '',
  id: Factory.each((i) => i),
  credentials: credentialFactory.buildList(3),
  address: 'http://www.example.com',
  body: '',
});

export const managedStatsFactory = Factory.Sync.makeFactory<ManagedStatsData>({
  cpu: [],
  disk: [],
  net_in: [],
  net_out: [],
  swap: [],
});
