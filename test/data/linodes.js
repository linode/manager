import { testType } from './types';

export const apiTestLinode = {
  group: 'Test Group',
  label: 'Test Linode',
  ipv4: '97.107.143.99',
  ipv6: '2600:3c03::f03c:91ff:fe0a:1dbe/64',
  created: '2016-07-06T16:47:27',
  id: 1234,
  type: [testType],
  status: 'running',
  datacenter: {
    id: 'newark',
    label: 'Newark, NJ',
  },
  distribution: {
    id: 'linode/ubuntu15.10',
    vendor: 'Ubuntu',
    label: 'Ubuntu 15.10',
  },
  alerts: {
    cpu: {
      enabled: true,
      threshold: 90,
    },
    io: {
      enabled: true,
      threshold: 5000,
    },
    transfer_in: {
      enabled: true,
      threshold: 5,
    },
    transfer_out: {
      enabled: true,
      threshold: 5,
    },
    transfer_quota: {
      enabled: true,
      threshold: 80,
    },
  },
  backups: {
    enabled: true,
    last_backup: '2016-06-09T15:05:55',
    schedule: {
      day: 'Monday',
      window: 'W10',
    },
  },
};

const testBackupDisks = [
  {
    label: 'root',
    filesystem: 'ext4',
    size: 2048,
  },
  {
    label: 'swap',
    filesystem: 'swap',
    size: 1024,
  },
];

export const testLinode = {
  ...apiTestLinode,
  _polling: false,
  _backups: {
    totalPages: 1,
    pagesFetched: [0],
    totalResults: 2,
    backups: {
      54778593: {
        type: 'auto',
        id: 54778593,
        created: '2016-06-09T15:05:55',
        finished: '2016-06-09T15:06:55',
        status: 'successful',
        availability: 'daily',
        datacenter: {
          label: 'Newark, NJ',
          id: 'newark',
        },
        configs: [
          'Some config',
        ],
        disks: testBackupDisks,
      },
      54778596: {
        type: 'snapshot',
        id: 54778596,
        created: '2016-06-09T15:11:55',
        finished: '2016-06-09T15:12:55',
        status: 'successful',
        label: 'Some snapshot',
        datacenter: {
          label: 'Newark, NJ',
          id: 'newark',
        },
        configs: [
          'Some config',
        ],
        disks: testBackupDisks,
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
        kernel: {
          id: 'linode/latest_64',
        },
        initrd: '',
        virt_mode: 'paravirt',
        run_level: 'default',
        ram_limit: 1024,
        root_device: '/dev/sda',
        root_device_ro: false,
        devtmpfs_automount: false,
        disks: {
          sda: {
            id: 12345,
          },
          sdb: {
            id: 12346,
          },
          sdc: null,
          sdd: null,
          sde: null,
          sdf: null,
          sdg: null,
          sdh: null,
        },
        helpers: {
          disable_updatedb: true,
          enable_distro_helper: true,
          enable_modules_dep_helper: true,
          enable_network_helper: true,
        },
        created: '2015-09-29 11:21:38 +0000',
        updated: '2015-09-29 11:21:38 +0000',
      },
    },
  },
  _ips: {
    ipv4: {
      private: [
        {
          linode_id: 1234,
          address: '192.168.1.2',
          rdns: 'p1-1.members.linode.com',
        },
      ],
      public: [
        {
          linode_id: 1234,
          address: '97.107.143.99',
          rdns: 'li1-1.members.linode.com',
        },
      ],
    },
    ipv6: [],
    ipv6_ranges: {
      global: [],
      'link-local': 'fe80::f03c:91ff:fe0a:181f/64',
      slaac: '2600:3c03::f03c:91ff:fe0a:1dbe/64',
    },
  },
};

export const linodes = {
  [testLinode.id]: testLinode,
  1233: {
    ...testLinode,
    id: 1233,
    _configs: {
      ...testLinode._configs,
      configs: {
        ...testLinode._configs.configs,
        12346: {
          ...testLinode._configs.configs[12345],
          id: 12346,
          disks: {
            ...testLinode._configs.configs[12345].disks,
            sdb: null,
          },
        },
      },
    },
  },
  1235: {
    ...testLinode,
    id: 1235,
    label: 'Test Linode 1',
    group: '',
    created: '2016-07-06T16:50:27',
    backups: { ...testLinode.backups, enabled: false },
    _backups: {
      ...testLinode._backups,
      totalResults: 4,
      backups: {
        ...testLinode._backups.backups,
        54778594: {
          type: 'auto',
          id: 54778594,
          created: '2016-06-08T15:05:55',
          finished: '2016-06-08T15:06:55',
          status: 'successful',
          availability: 'weekly',
          datacenter: {
            label: 'Newark, NJ',
            id: 'newark',
          },
        },
        54778595: {
          type: 'auto',
          id: 54778595,
          created: '2016-06-01T15:05:55',
          finished: '2016-06-01T15:06:55',
          status: 'successful',
          availability: 'weekly',
          datacenter: {
            label: 'Newark, NJ',
            id: 'newark',
          },
        },
      },
    },
  },
  1236: {
    ...testLinode,
    id: 1236,
    label: 'Test Linode 2',
    status: 'offline',
    created: '2016-07-06T16:48:27',
    backups: { ...testLinode.backups, enabled: false },
    _backups: {
      ...testLinode._backups,
      totalResults: 0,
      backups: {},
    },
  },
  1237: {
    ...testLinode,
    id: 1237,
    label: 'Test Linode 3',
    status: 'booting',
    created: '2016-07-06T16:49:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  1238: {
    ...testLinode,
    id: 1238,
    label: 'Test Linode 4',
    status: 'running',
    backups: { ...testLinode.backups, enabled: false },
    _configs: {
      ...testLinode._configs,
      totalResults: 2,
      configs: {
        ...testLinode._configs.configs,
        12346: {
          id: 12346,
          label: 'Test config 2',
        },
      },
    },
  },
  1239: {
    ...testLinode,
    id: 1239,
    label: 'Test Linode 5',
    status: 'running',
    backups: { ...testLinode.backups, enabled: false },
    _configs: {
      totalResults: 0,
      totalPages: 1,
      configs: {},
    },
  },
  1240: { // With unallocated space
    ...testLinode,
    id: 1240,
    label: 'Test Linode 6',
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
  },
  1241: {
    ...testLinode,
    id: 1241,
    label: 'Test Linode 7',
    status: 'running',
    backups: { ...testLinode.backups, enabled: false },
    _configs: {
      totalResults: 0,
      totalPages: -1,
      configs: {},
    },
  },
  1242: {
    ...testLinode,
    id: 1242,
    label: 'Test Linode 1242',
    status: 'running',
    backups: { ...testLinode.backups, enabled: false },
    _disks: {
      totalResults: 0,
      totalPages: -1,
      disks: {},
    },
  },
  1243: {
    ...testLinode,
    id: 1243,
    label: 'Test Linode 1243',
    status: 'unrecognized',
    backups: { ...testLinode.backups, enabled: false },
  },
  1244: {
    ...testLinode,
    id: 1244,
    label: 'Test Linode, offline with multiple configs',
    status: 'offline',
    backups: { ...testLinode.backups, enabled: false },
    _configs: {
      ...testLinode._configs,
      totalResults: 2,
      configs: {
        ...testLinode._configs.configs,
        12346: {
          id: 12346,
          label: 'Test config 2',
        },
      },
    },
  },
  1245: {
    ...testLinode,
    id: 1245,
    label: 'no_private_ipv4',
    backups: { ...testLinode.backups, enabled: false },
    _ips: {
      ...testLinode._ips,
      ipv4: {
        ...testLinode._ips.ipv4,
        private: [],
      },
    },
  },
};
