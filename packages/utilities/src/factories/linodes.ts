import { Factory } from './factoryProxy';

import type {
  CreateLinodeRequest,
  Linode,
  LinodeAlerts,
  LinodeBackup,
  LinodeBackups,
  LinodeIPsResponse,
  LinodePlacementGroupPayload,
  LinodeSpecs,
  LinodeType,
  NetStats,
  RegionalNetworkUtilization,
  Stats,
  StatsData,
} from '@linode/api-v4';

export const linodeAlertsFactory = Factory.Sync.makeFactory<LinodeAlerts>({
  cpu: 10,
  io: 10000,
  network_in: 0,
  network_out: 0,
  transfer_quota: 80,
});

export const linodeSpecsFactory = Factory.Sync.makeFactory<LinodeSpecs>({
  accelerated_devices: 1,
  disk: 51200,
  gpus: 0,
  memory: 2048,
  transfer: 2000,
  vcpus: 1,
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
  private_out: generateLinodeStatSeries(),
});

export const statsDataFactory = Factory.Sync.makeFactory<StatsData>({
  cpu: generateLinodeStatSeries(),
  io: {
    io: generateLinodeStatSeries(),
    swap: generateLinodeStatSeries(),
  },
  netv4: linodeNetStatsFactory.build(),
  netv6: linodeNetStatsFactory.build(),
});

export const linodeStatsFactory = Factory.Sync.makeFactory<Stats>({
  data: statsDataFactory.build(),
  title: 'Some fake stats',
});

export const linodeIPFactory = Factory.Sync.makeFactory<LinodeIPsResponse>({
  ipv4: {
    private: [],
    public: [
      {
        address: '10.11.12.13',
        gateway: '10.11.12.13',
        interface_id: null,
        linode_id: 1,
        prefix: 24,
        public: true,
        rdns: 'lixxx-xxxxxx.members.linode.com',
        region: 'us-southeast',
        subnet_mask: '255.255.255.0',
        type: 'ipv4',
      },
    ],
    reserved: [],
    shared: [],
  },
  ipv6: {
    global: [
      {
        prefix: 64,
        range: '2600:3c02:e000:0201::',
        region: 'us-southeast',
        route_target: '2600:3c02::f03c:92ff:fe9d:0f25',
      },
    ],
    link_local: {
      address: '2001:DB8::0000',
      gateway: 'fe80::1',
      interface_id: null,
      linode_id: 1,
      prefix: 64,
      public: false,
      rdns: null,
      region: 'us-southeast',
      subnet_mask: 'ffff:ffff:ffff:ffff::',
      type: 'ipv6',
    },
    slaac: {
      address: '2001:DB8::0000',
      gateway: 'fe80::1',
      interface_id: null,
      linode_id: 1,
      prefix: 64,
      public: true,
      rdns: null,
      region: 'us-southeast',
      subnet_mask: 'ffff:ffff:ffff:ffff::',
      type: 'ipv6',
    },
  },
});

export const linodeBackupFactory = Factory.Sync.makeFactory<LinodeBackup>({
  available: true,
  configs: ['My Alpine 3.17 Disk Profile'],
  created: '2020-01-01',
  disks: [],
  finished: '2020-01-01',
  id: Factory.each((i) => i),
  label: Factory.each((i) => `Backup ${i}`),
  region: 'us-east',
  status: 'successful',
  type: 'auto',
  updated: '2020-01-01',
});

export const linodeBackupsFactory = Factory.Sync.makeFactory<LinodeBackups>({
  enabled: true,
  last_successful: '2020-01-01',
  schedule: {
    day: 'Scheduling',
    window: 'Scheduling',
  },
});

export const linodeTransferFactory =
  Factory.Sync.makeFactory<RegionalNetworkUtilization>({
    billable: 0,
    quota: 1950, // GB
    region_transfers: [
      {
        billable: 0,
        id: 'id-cgk',
        quota: 1200, // GB
        used: 1120000000000, // Bytes
      },
      {
        billable: 0,
        id: 'br-gru',
        quota: 1500, // GB
        used: 90000000000, // Bytes
      },
    ],
    used: 13956637, // Bytes
  });

export const linodeTypeFactory = Factory.Sync.makeFactory<LinodeType>({
  accelerated_devices: 0,
  addons: {
    backups: {
      price: {
        hourly: 0.004,
        monthly: 2.5,
      },
      region_prices: [
        {
          hourly: 0.0048,
          id: 'id-cgk',
          monthly: 3.57,
        },
        {
          hourly: 0.0056,
          id: 'br-gru',
          monthly: 4.17,
        },
      ],
    },
  },
  class: 'standard',
  disk: 51200,
  gpus: 0,
  id: Factory.each((i) => `g6-standard-${i}`),
  label: Factory.each((i) => `Linode ${i}GB`),
  memory: 2048,
  network_out: 2000,
  price: {
    hourly: 0.015,
    monthly: 10.0,
  },
  region_prices: [
    {
      hourly: 0.021,
      id: 'br-gru',
      monthly: 14,
    },
    {
      hourly: 0.018,
      id: 'id-cgk',
      monthly: 12,
    },
  ],
  successor: null,
  transfer: 2000,
  vcpus: 1,
});

export const dedicatedTypeFactory = linodeTypeFactory.extend({
  class: 'dedicated',
  id: Factory.each((i) => `g6-dedicated-${i}`),
  label: Factory.each((i) => `Dedicated 2${i}GB`),
});

export const proDedicatedTypeFactory = Factory.Sync.makeFactory<LinodeType>({
  accelerated_devices: 0,
  addons: {
    backups: {
      price: {
        hourly: null,
        monthly: null,
      },
      region_prices: [
        {
          hourly: null,
          id: 'id-cgk',
          monthly: null,
        },
        {
          hourly: null,
          id: 'br-gru',
          monthly: null,
        },
      ],
    },
  },
  class: 'prodedicated',
  disk: 5120000,
  gpus: 0,
  id: Factory.each((i) => `g6-prodedicated-${i}`),
  label: Factory.each((i) => `Pro Dedicated 2${i}GB`),
  memory: 262144,
  network_out: 11000,
  price: {
    hourly: 2.88,
    monthly: 1920.0,
  },
  region_prices: [
    {
      hourly: 4.032,
      id: 'br-gru',
      monthly: 2688,
    },
    {
      hourly: 3.436,
      id: 'id-cgk',
      monthly: 2304,
    },
  ],
  successor: null,
  transfer: 11000,
  vcpus: 56,
});

export const linodePlacementGroupPayloadFactory =
  Factory.Sync.makeFactory<LinodePlacementGroupPayload>({
    id: Factory.each((i) => i),
    label: Factory.each((i) => `pg-${i}`),
    migrating_to: null,
    placement_group_policy: 'strict',
    placement_group_type: 'anti_affinity:local',
  });

export const linodeFactory = Factory.Sync.makeFactory<Linode>({
  alerts: linodeAlertsFactory.build(),
  backups: linodeBackupsFactory.build(),
  capabilities: [],
  created: '2020-01-01',
  disk_encryption: 'enabled',
  group: '',
  hypervisor: 'kvm',
  id: Factory.each((i) => i),
  image: 'linode/debian12',
  interface_generation: 'legacy_config',
  ipv4: ['50.116.6.212', '192.168.203.1'],
  ipv6: '2600:3c00::f03c:92ff:fee2:6c40/64',
  label: Factory.each((i) => `linode-${i}`),
  lke_cluster_id: null,
  placement_group: linodePlacementGroupPayloadFactory.build({
    id: 1,
    label: 'pg-1',
  }),
  region: 'us-east',
  site_type: 'core',
  specs: linodeSpecsFactory.build(),
  status: 'running',
  tags: [],
  type: 'g6-standard-1',
  updated: '2020-01-01',
  watchdog_enabled: true,
});

export const createLinodeRequestFactory =
  Factory.Sync.makeFactory<CreateLinodeRequest>({
    booted: true,
    image: 'linode/debian12',
    label: Factory.each((i) => `linode-${i}`),
    region: 'us-southeast',
    root_pass: 'linode-root-password',
    type: 'g6-standard-1',
  });

export const backupFactory = Factory.Sync.makeFactory<LinodeBackup>({
  available: true,
  configs: ['Restore 319718 - My Alpine 3.17 Disk Profile'],
  created: '2023-05-03T04:00:47',
  disks: [
    {
      filesystem: 'ext4',
      label: 'Restore 319718 - Alpine 3.17 Disk',
      size: 25088,
    },
    {
      filesystem: 'swap',
      label: 'Restore 319718 - 512 MB Swap Image',
      size: 512,
    },
  ],
  finished: '2023-05-03T04:02:11',
  id: Factory.each((i) => i),
  label: null,
  region: 'us-central',
  status: 'successful',
  type: 'auto',
  updated: '2023-05-03T04:04:07',
});
