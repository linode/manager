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
  id: 1234,
  _polling: false,
  services: [
    {
      service_type: 'linode',
      label: 'Linode 1024',
      ram: 1024,
      hourly_price: 1,
      id: 'linode1024.5',
      transfer: 2000,
      monthly_price: 1000,
      storage: 12,
      mbits_out: 125,
      vcpus: 1,
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
      54778593: {
        type: 'auto',
        id: 54778593,
        created: '2016-06-09T15:05:55',
        finished: '2016-06-09T15:06:55',
        status: 'successful',
        datacenter: {
          label: 'Newark, NJ',
          id: 'newark',
        },
      },
      54778596: {
        type: 'snapshot',
        id: 54778593,
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
        kernel: { id: 'linode/latest_64' },
        virt_mode: 'paravirt',
        run_level: 'default',
        ram_limit: 1024,
        root_device: '/dev/sda',
        root_device_ro: false,
        devtmpfs_automount: false,
        disks: {
          // TODO
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
};

export const linodes = {
  [testLinode.id]: testLinode,
  1235: {
    ...testLinode,
    id: 1235,
    label: 'Test Linode 1',
    group: '',
    created: '2016-07-06T16:50:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  1236: {
    ...testLinode,
    id: 1236,
    label: 'Test Linode 2',
    state: 'offline',
    created: '2016-07-06T16:48:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  1237: {
    ...testLinode,
    id: 1237,
    label: 'Test Linode 3',
    state: 'booting',
    created: '2016-07-06T16:49:27',
    backups: { ...testLinode.backups, enabled: false },
  },
  1238: {
    ...testLinode,
    id: 1238,
    label: 'Test Linode 4',
    state: 'running',
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
    state: 'running',
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
    state: 'offline',
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
};
