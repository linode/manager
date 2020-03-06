import * as Factory from 'factory.ts';
import {
  Linode,
  LinodeAlerts,
  LinodeBackups,
  LinodeSpecs
} from 'linode-js-sdk/lib/linodes/types';

export const linodeAlertsFactory = Factory.Sync.makeFactory<LinodeAlerts>({
  cpu: 10,
  network_in: 0,
  network_out: 0,
  transfer_quota: 80,
  io: 10000
});

export const linodeSpecsFactory = Factory.Sync.makeFactory<LinodeSpecs>({
  disk: 51200,
  memory: 2048,
  vcpus: 1,
  gpus: 0,
  transfer: 2000
});

export const linodeBackupsFactory = Factory.Sync.makeFactory<LinodeBackups>({
  enabled: true,
  schedule: {
    day: 'Scheduling',
    window: 'Scheduling'
  },
  last_successful: '2020-01-01'
});

export const linodeFactory = Factory.Sync.makeFactory<Linode>({
  id: Factory.each(i => i),
  label: Factory.each(i => `linode-${i}`),
  type: 'g6-standard-1',
  region: 'us-east',
  created: '2020-01-01',
  updated: '2020-01-01',
  hypervisor: 'kvm',
  image: 'linode/debian10',
  watchdog_enabled: true,
  status: 'running',
  ipv4: ['192.168.0.0'],
  ipv6: '2600:3c00::f03c:92ff:fee2:6c40/64',
  group: '',
  alerts: linodeAlertsFactory.build(),
  specs: linodeSpecsFactory.build(),
  tags: [],
  backups: linodeBackupsFactory.build()
});
