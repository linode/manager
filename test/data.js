export const state = {
  create: {
    source: {
      source: null,
      sourceTab: 0,
    },
    datacenter: {
      datacenter: null,
    },
    service: {
      service: null,
    },
  },
  distros: {
    distributions: { },
  },
  datacenters: {
    datacenters: {
      newark: {
        id: 'newark',
        label: 'Newark, NJ',
        country: 'us',
      },
    },
  },
  services: {
    services: {
      'linode1024.5': {
        disk: 24,
        hourly_price: 1,
        id: 'linode1024.5',
        label: 'Linode 1024',
        mbits_out: 25,
        monthly_price: 1000,
        ram: 1024,
        service_type: 'linode',
        transfer: 2000,
        vcpus: 1,
      },
      'linode2048.5': {
        disk: 48,
        hourly_price: 2,
        id: 'linode2048.5',
        label: 'Linode 2048',
        mbits_out: 25,
        monthly_price: 2000,
        ram: 2024,
        service_type: 'linode',
        transfer: 3000,
        vcpus: 2,
      },
    },
  },
};

export const testLinode = {
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
    country: 'us',
  },
  distribution: {
    id: 'linode/ubuntu15.10',
    vendor: 'Ubuntu',
    label: 'Ubuntu 15.10',
  },
  _polling: false,
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
          country: 'us',
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
          country: 'us',
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
        comments: 'Test comment',
        created: '2015-09-29 11:21:38 +0000',
        devtmpfs_automount: false,
        disks: {
          sda: {
            id: 'ubuntu15.10',
            label: 'Ubuntu Disk',
            size: 4000,
            filesystem: 'ext4',
            state: 'ok',
            created: '2016-05-12 13:36:42 +0000',
            updated: '2016-05-12 13:36:42 +0000',
          },
          sdb: null,
          sdc: null,
          sdd: null,
          sde: null,
          sdf: null,
          sdg: null,
          sdh: null,
        },
      },
    },
  },
};

export const linodes = {
  pagesFetched: [0],
  totalPages: 1,
  linodes: {
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
        configs: [],
      },
    },
  },
  _singular: 'linode',
  _plural: 'linodes',
};

export const testDistros = {
  distro_1234: {
    id: 'linode/arch2016.05',
    recommended: true,
    vendor: 'Arch',
    label: 'Arch Linux 2016.05',
    created: '2009-08-17T00:00:00',
  },
  distro_1235: {
    id: 'linode/arch2015.05',
    recommended: false,
    vendor: 'Arch',
    label: 'Arch Linux 2015.05',
    created: '2009-08-17T00:00:00',
  },
  distro_1236: {
    id: 'linode/debian7',
    recommended: true,
    vendor: 'Debian',
    label: 'Debian 7',
    created: '2009-08-17T00:00:00',
  },
  distro_1237: {
    id: 'linode/debian8.1',
    recommended: true,
    vendor: 'Debian',
    label: 'Debian 8.1',
    created: '2009-08-17T00:00:00',
  },
  distro_1238: {
    id: 'linode/debian6',
    recommended: false,
    vendor: 'Debian',
    label: 'Debian 6',
    created: '2009-08-17T00:00:00',
  },
};
