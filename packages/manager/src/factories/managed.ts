import * as Factory from 'factory.ts';
import {
  ManagedCredential,
  ManagedServiceMonitor,
  ManagedStatsData
} from '@linode/api-v4/lib/managed/types';

export const credentialFactory = Factory.Sync.makeFactory<ManagedCredential>({
  id: Factory.each(i => i),
  last_decrypted: '2019-07-01',
  label: 'credential-1'
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
  id: Factory.each(i => i),
  credentials: credentialFactory.buildList(3),
  address: 'http://www.example.com',
  body: ''
});

export const managedStatsFactory = Factory.Sync.makeFactory<ManagedStatsData>({
  cpu: [],
  disk: [],
  net_in: [],
  net_out: [],
  swap: []
});
