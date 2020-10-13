import { NetworkUtilization } from '@linode/api-v4/lib/account';
import {
  Linode,
  LinodeAlerts,
  LinodeBackups,
  LinodeIPsResponse,
  LinodeSpecs,
  NetStats,
  Stats,
  StatsData
} from '@linode/api-v4/lib/linodes/types';
import * as Factory from 'factory.ts';

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

export const generateLinodeStatSeries = (): [number, number][] => {
  const stat = [];
  let i = 0;
  for (i; i < 300; i++) {
    stat.push([Date.now() - i * 1000, Math.floor(Math.random() * 50)]);
  }
  return stat as [number, number][];
};

export const linodeNetStatsFactory = Factory.Sync.makeFactory<NetStats>({
  in: generateLinodeStatSeries(),
  out: generateLinodeStatSeries(),
  private_in: generateLinodeStatSeries(),
  private_out: generateLinodeStatSeries()
});

export const statsDataFactory = Factory.Sync.makeFactory<StatsData>({
  cpu: generateLinodeStatSeries(),
  io: {
    io: generateLinodeStatSeries(),
    swap: generateLinodeStatSeries()
  },
  netv4: linodeNetStatsFactory.build(),
  netv6: linodeNetStatsFactory.build()
});

export const linodeStatsFactory = Factory.Sync.makeFactory<Stats>({
  title: 'Some fake stats',
  data: statsDataFactory.build()
});

export const linodeIPFactory = Factory.Sync.makeFactory<LinodeIPsResponse>({
  ipv4: {
    public: [
      {
        address: '10.11.12.13',
        gateway: '10.11.12.13',
        subnet_mask: '255.255.255.0',
        prefix: 24,
        type: 'ipv4',
        public: true,
        rdns: 'lixxx-xxxxxx.members.linode.com',
        linode_id: 1,
        region: 'us-southeast'
      }
    ],
    private: [],
    shared: [],
    reserved: []
  },
  ipv6: {
    slaac: {
      address: '2001:DB8::0000',
      gateway: 'fe80::1',
      subnet_mask: 'ffff:ffff:ffff:ffff::',
      prefix: 64,
      type: 'ipv6',
      rdns: null,
      linode_id: 1,
      region: 'us-southeast',
      public: true
    },
    link_local: {
      address: '2001:DB8::0000',
      gateway: 'fe80::1',
      subnet_mask: 'ffff:ffff:ffff:ffff::',
      prefix: 64,
      type: 'ipv6',
      rdns: null,
      linode_id: 1,
      region: 'us-southeast',
      public: false
    },
    global: []
  }
});

export const linodeBackupsFactory = Factory.Sync.makeFactory<LinodeBackups>({
  enabled: true,
  schedule: {
    day: 'Scheduling',
    window: 'Scheduling'
  },
  last_successful: '2020-01-01'
});

export const linodeTransferFactory = Factory.Sync.makeFactory<
  NetworkUtilization
>({
  used: 13956637,
  quota: 1950,
  billable: 0
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
