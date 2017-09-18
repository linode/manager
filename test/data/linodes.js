import { testType } from './types';
import { apiTestRegion } from './regions';

const stats = {
  netv6: {
    in: [[1490377800000, 0]],
    private_in: [[1490377800000, 0]],
    out: [[1490377800000, 0]],
    private_out: [[1490377800000, 0]],
  },
  netv4: {
    in: [[1490377800000, 0]],
    private_in: [[1490377800000, 0]],
    out: [[1490377800000, 0]],
    private_out: [[1490377800000, 0]],
  },
  cpu: [[1490378700000, 1.67]],
  io: {
    swap: [[1490378100000, 0]],
    io: [[1490379000000, 0.91]],
  },
};

function createTestStats() {
  return stats;
}

let usedIPv4UpTo = 0;
function createTestIPv4(linodeId, type = 'public') {
  const address = `97.107.143.${usedIPv4UpTo++}`;
  return {
    address,
    type,
    version: 'ipv4',
    linode_id: linodeId,
    gateway: '97.107.143.0',
    rdns: 'li1-1.members.linode.com',
    prefix: type === 'public' ? 24 : 17,
    key: address,
  };
}

let usedIPv6UpTo = 0;
function createTestIPv6(linodeId) {
  const address = `2600:3c03::f03c:91ff:fe0a:${usedIPv6UpTo++}`;

  return {
    address,
    key: address,
    linode_id: linodeId,
    gateway: 'fe80::1',
    rdns: 'li1-1.members.linode.com',
    type: 'public',
    version: 'ipv6',
    prefix: '64',
  };
}

function createTestLinkLocal(linodeId) {
  const address = 'fe80::f03c:91ff:fe0a:181f';

  return {
    address,
    key: address,
    linode_id: linodeId,
    type: 'link-local',
    version: 'ipv6',
  };
}

function createTestSlaac(linodeId) {
  const ipv6 = createTestIPv6(linodeId);

  return {
    ...ipv6,
    type: 'slaac',
  };
}

function createTestLinode(id) {
  const ipv4 = createTestIPv4(id);
  const secondIPv4 = createTestIPv4(id);
  const ipv6 = createTestIPv6(id);
  const privateIPv4 = createTestIPv4(id, 'private');

  const slaac = createTestSlaac(id);
  const linkLocal = createTestLinkLocal(id);

  return {
    id,
    group: 'Test Group',
    hypervisor: 'kvm',
    label: `test-linode-${id}`,
    ipv4: [ipv4.address, secondIPv4.address],
    ipv6: ipv6.address,
    created: '2016-07-06T16:47:27',
    type: testType,
    status: 'running',
    region: apiTestRegion.id,
    memory: 2048,
    disk: 20480,
    vcpus: 2,
    distribution: {
      id: 'linode/ubuntu15.10',
      vendor: 'Ubuntu',
      label: 'Ubuntu 15.10',
    },
    alerts: {
      cpu: 90,
      io: 5000,
      transfer_in: 5,
      transfer_out: 5,
      transfer_quota: 80,
    },
    backups: {
      enabled: true,
      schedule: {
        day: 'Monday',
        window: 'W10',
      },
    },
    _stats: createTestStats(),
    _polling: false,
    _backups: {
      daily: {
        finished: '2017-01-31T07:30:03',
        label: null,
        type: 'auto',
        updated: '2017-01-31T12:32:01',
        status: 'successful',
        disks: [
          {
            size: 2330,
            label: 'Ubuntu 15.10 Disk',
            filesystem: 'ext4',
          }, {
            size: 0,
            label: '512 MB Swap Image',
            filesystem: 'swap',
          },
        ],
        id: 54782214,
        availability: 'daily',
        created: '2017-01-31T07:28:52',
        configs: [
          'Ubuntu Disk',
        ],
        region: apiTestRegion.id,
      },
      snapshot: {
        current: {
          finished: '2017-01-31T21:51:51',
          label: 'the label',
          type: 'snapshot',
          updated: '2017-01-31T21:51:51',
          status: 'successful',
          disks: [
            {
              size: 2330,
              label: 'Ubuntu 15.10 Disk',
              filesystem: 'ext4',
            }, {
              size: 0,
              label: '512 MB Swap Image',
              filesystem: 'swap',
            },
          ],
          id: 54782236,
          availability: 'unavailable',
          created: '2017-01-31T21:50:42',
          configs: [
            'Some config',
          ],
          region: apiTestRegion.id,
        },
        in_progress: null,
      },
      weekly: [],
    },
    _volumes: {
      totalPages: 1,
      pagesFetched: [0],
      totalResults: 1,
      volumes: {
        38: {
          id: 38,
          label: 'test',
          linode_id: null,
          status: 'active',
          created: '2017-08-08T13:55:16',
          region: 'us-east-1a',
          updated: '2017-08-08T04:00:00',
          size: 20,
        },
      },
    },
    _disks: {
      totalPages: 1,
      pagesFetched: [0],
      totalResults: 2,
      disks: {
        12345: {
          id: 12345,
          size: 6144,
          created: '2016-08-09T19:47:11',
          updated: '2016-08-09T19:47:11',
          filesystem: 'ext4',
          label: 'Arch Linux 2015.08 Disk',
        },
        12346: {
          id: 12346,
          size: 6144,
          created: '2016-08-09T19:47:11',
          updated: '2016-08-09T19:47:11',
          filesystem: 'swap',
          label: 'Swap Disk',
        },
      },
    },
    _configs: {
      totalPages: 1,
      pagesFetched: [0],
      totalResults: 1,
      configs: {
        12345: {
          id: 12345,
          label: 'Test config',
          comments: 'Test comments',
          kernel: 'linode/latest_64',
          initrd: '',
          virt_mode: 'paravirt',
          run_level: 'default',
          memory_limit: 1024,
          root_device: '/dev/sda',
          root_device_ro: false,
          devtmpfs_automount: false,
          devices: {
            sda: { disk_id: 12345 },
            sdb: { disk_id: 12346 },
            sdc: null,
            sdd: null,
            sde: null,
            sdf: null,
            sdg: null,
            sdh: null,
          },
          helpers: {
            updatedb_disabled: true,
            distro: true,
            modules_dep: true,
            network: true,
          },
          created: '2015-09-29 11:21:38 +0000',
          updated: '2015-09-29 11:21:38 +0000',
        },
      },
    },
    _ips: {
      [privateIPv4.key]: privateIPv4,
      [ipv4.key]: ipv4,
      [linkLocal.key]: linkLocal,
      [slaac.key]: slaac,
    },
    _shared: [],
  };
}

export const testLinode = {
  ...createTestLinode(1234),
  label: 'test-linode',
};

export const testLinode1233 = {
  ...createTestLinode(1233),
  _configs: {
    ...testLinode._configs,
    configs: {
      ...testLinode._configs.configs,
      12346: {
        ...testLinode._configs.configs['12345'],
        id: 12346,
        devices: {
          ...testLinode._configs.configs['12345'].devices,
          sdb: null,
        },
      },
    },
  },
};

export const testLinode1235 = {
  ...createTestLinode(1235),
  label: 'test-linode-1',
  group: '',
  created: '2016-07-06T16:50:27',
  backups: { ...testLinode.backups, enabled: false },
  _backups: {
    ...testLinode._backups,
    weekly: [
      {
        finished: '2017-01-31T07:30:03',
        label: null,
        type: 'auto',
        updated: '2017-01-31T12:32:01',
        status: 'successful',
        disks: [
          {
            size: 2330,
            label: 'Ubuntu 15.10 Disk',
            filesystem: 'ext4',
          }, {
            size: 0,
            label: '512 MB Swap Image',
            filesystem: 'swap',
          },
        ],
        id: 54782216,
        availability: 'daily',
        created: '2017-01-31T07:28:52',
        configs: [
          'aConfig',
        ],
        region: apiTestRegion.id,
      }, {
        finished: '2017-01-31T07:30:03',
        label: null,
        type: 'auto',
        updated: '2017-01-31T12:32:01',
        status: 'successful',
        disks: [
          {
            size: 2330,
            label: 'Ubuntu 15.10 Disk',
            filesystem: 'ext4',
          }, {
            size: 0,
            label: '512 MB Swap Image',
            filesystem: 'swap',
          },
        ],
        id: 54782217,
        availability: 'daily',
        created: '2017-01-31T07:28:52',
        configs: [
          'My Ubuntu 15.10 Disk',
        ],
        region: apiTestRegion.id,
      },
    ],
  },
};

export const testLinode1236 = {
  ...createTestLinode(1236),
  label: 'test-linode-2',
  status: 'offline',
  created: '2016-07-06T16:48:27',
  backups: { ...testLinode.backups, enabled: false },
  _backups: {
    snapshot: {
      current: null,
      in_progress: null,
    },
    daily: null,
    weekly: [],
  },
};

export const testLinode1237 = {
  ...createTestLinode(1237),
  label: 'test-linode-3',
  status: 'booting',
  created: '2016-07-06T16:49:27',
  backups: { ...testLinode.backups, enabled: false },
};

export const testLinode1238 = {
  ...createTestLinode(1238),
  label: 'test-linode-4',
  status: 'offline',
  backups: { ...testLinode.backups, enabled: false },
  _configs: {
    ...testLinode._configs,
    totalResults: 2,
    configs: {
      ...testLinode._configs.configs,
      12346: {
        ...testLinode._configs.configs['12345'],
        id: 12346,
        label: 'Test config 2',
      },
    },
  },
};

export const testLinode1239 = {
  ...createTestLinode(1239),
  label: 'test-linode-5',
  status: 'running',
  backups: { ...testLinode.backups, enabled: false },
  _configs: {
    totalResults: 0,
    totalPages: 1,
    configs: {},
  },
};

export const testLinodeWithUnallocatedSpace = {
  ...createTestLinode(1240),
  label: 'test-linode-6',
  status: 'offline',
  backups: { ...testLinode.backups, enabled: false },
  _disks: {
    totalResults: 2,
    totalPages: 1,
    disks: {
      12345: {
        id: 12345,
        size: 6144,
        created: '2016-08-09T19:47:11',
        updated: '2016-08-09T19:47:11',
        filesystem: 'ext4',
        label: 'Arch Linux 2015.08 Disk',
      },
      12346: {
        id: 12346,
        size: 1024,
        created: '2016-08-09T19:47:11',
        updated: '2016-08-09T19:47:11',
        filesystem: 'swap',
        label: 'Swap Disk',
      },
    },
  },
};

export const testLinode1241 = {
  ...createTestLinode(1241),
  label: 'test-linode-7',
  status: 'running',
  backups: { ...testLinode.backups, enabled: false },
  _configs: {
    totalResults: 0,
    totalPages: -1,
    configs: {},
  },
};

export const testLinode1242 = {
  ...createTestLinode(1242),
  status: 'running',
  backups: { ...testLinode.backups, enabled: false },
  _disks: {
    totalResults: 0,
    totalPages: -1,
    disks: {},
  },
};

export const testLinode1243 = {
  ...createTestLinode(1243),
  status: 'offline',
  backups: { ...testLinode.backups, enabled: false },
};

export const testLinode1245 = {
  ...createTestLinode(1245),
  backups: {
    ...testLinode.backups,
  },
  _ips: {
    ...testLinode._ips,
    ipv4: {
      ...testLinode._ips.ipv4,
      public: [createTestIPv4(1245)],
      private: [],
    },
  },
};

export const testLinode1246 = {
  ...createTestLinode(1246),
  distribution: null,
};

export const linodes = [
  testLinode,
  testLinode1233,
  testLinode1235,
  testLinode1236,
  testLinode1237,
  testLinode1238,
  testLinode1239,
  testLinodeWithUnallocatedSpace,
  testLinode1241,
  testLinode1242,
  testLinode1243,
  testLinode1245,
  testLinode1246,
].reduce((object, linode) => ({ ...object, [linode.id]: linode }), {});
