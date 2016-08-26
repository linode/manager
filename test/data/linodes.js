export const apiTestLinode = {
  group: 'Test Group',
  label: 'Test Linode',
  ips: {
    public: {
      ipv6: '2600:3c03::f03c:91ff:fe96:43e7',
      failover: [],
      ipv4: [
        '97.107.143.56',
      ],
    },
    private: {
      link_local: 'fe80::f03c:91ff:fe96:43e7',
      ipv4: [
        '321.456.789.1',
      ],
    },
  },
  created: '2016-07-06T16:47:27',
  id: 'linode_1234',
  services: [
    {
      service_type: 'linode',
      label: 'Linode 1024',
    },
  ],
  state: 'running',
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

export const testLinode = {
  ...apiTestLinode,
  _polling: false,
  _backups: {
    totalPages: 1,
    pagesFetched: [0],
    totalResults: 2,
    backups: {
      backup_54778593: {
        type: 'auto',
        id: 'backup_54778593',
        created: '2016-06-09T15:05:55',
        finished: '2016-06-09T15:06:55',
        status: 'successful',
        datacenter: {
          label: 'Newark, NJ',
          id: 'newark',
        },
      },
      backup_54778596: {
        type: 'snapshot',
        id: 'backup_54778593',
        created: '2016-06-09T15:11:55',
        finished: '2016-06-09T15:12:55',
        status: 'successful',
        datacenter: {
          label: 'Newark, NJ',
          id: 'newark',
        },
      },
    },
  },
  _disks: {
    totalPages: 1,
    pagesFetched: [0],
    totalResults: 2,
    disks: {
      disk_12345: {
        id: 'disk_12345',
        size: 24064,
        created: '2016-08-09T19:47:11',
        updated: '2016-08-09T19:47:11',
        filesystem: 'ext4',
        label: 'Arch Linux 2015.08 Disk',
      },
      disk_12346: {
        id: 'disk_12346',
        size: 24064,
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
      config_12345: {
        id: 'config_12345',
        label: 'Test config',
        // TODO: Fill this out more
      },
    },
  },
};

export const linodes = {
  [testLinode.id]: testLinode,
  linode_1235: {
    ...testLinode,
    id: 'linode_1235',
    label: 'Test Linode 1',
    group: '',
    created: '2016-07-06T16:50:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  linode_1236: {
    ...testLinode,
    id: 'linode_1236',
    label: 'Test Linode 2',
    state: 'offline',
    created: '2016-07-06T16:48:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  linode_1237: {
    ...testLinode,
    id: 'linode_1237',
    label: 'Test Linode 3',
    state: 'booting',
    created: '2016-07-06T16:49:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  linode_1238: {
    ...testLinode,
    id: 'linode_1238',
    label: 'Test Linode 4',
    state: 'running',
    backups: { ...testLinode.backups, enabled: false },
    _configs: {
      ...testLinode._configs,
      totalResults: 2,
      configs: {
        ...testLinode._configs.configs,
        config_12346: {
          id: 'config_12346',
          label: 'Test config 2',
        },
      },
    },
  },
  linode_1239: {
    ...testLinode,
    id: 'linode_1239',
    label: 'Test Linode 5',
    state: 'running',
    backups: { ...testLinode.backups, enabled: false },
    _configs: {
      totalResults: 0,
      totalPages: 1,
      configs: {},
    },
  },
};
