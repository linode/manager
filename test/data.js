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
      datacenter_2: {
        id: 'datacenter_2',
        label: 'Newark, NJ',
      },
    },
  },
  services: {
    services: {
      service_112: {
        disk: 24,
        hourly_price: 1,
        id: 'service_112',
        label: 'Linode 1024',
        mbits_out: 25,
        monthly_price: 1000,
        ram: 1024,
        service_type: 'linode',
        transfer: 2000,
        vcpus: 1,
      },
      service_114: {
        disk: 48,
        hourly_price: 2,
        id: 'service_114',
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
  ip_addresses: {
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
  id: 'linode_1234',
  services: {
    linode: 'Linode 1024',
  },
  backups: {
    last_backup: null,
    enabled: false,
  },
  state: 'running',
  datacenter: {
    id: 'datacenter_6',
    label: 'Newark, NJ',
    datacenter: 'newark',
  },
  distribution: {
    id: 'distro_123',
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
};

export const linodes = {
  pagesFetched: [0],
  totalPages: 1,
  linodes: {
    [testLinode.id]: testLinode,
    linode_1235: { ...testLinode, id: 'linode_1235', group: '' },
    linode_1236: { ...testLinode, id: 'linode_1236', state: 'offline' },
    linode_1237: { ...testLinode, id: 'linode_1236', state: 'booting' },
  },
  _singular: 'linode',
  _plural: 'linodes',
};

export const testDistros = {
  distro_1234: {
    id: 'distro_1234',
    recommended: true,
    vendor: 'Arch',
    label: 'Arch Linux 2016.05',
    created: '2009-08-17T00:00:00',
  },
  distro_1235: {
    id: 'distro_1235',
    recommended: false,
    vendor: 'Arch',
    label: 'Arch Linux 2015.05',
    created: '2009-08-17T00:00:00',
  },
  distro_1236: {
    id: 'distro_1236',
    recommended: true,
    vendor: 'Debian',
    label: 'Debian 7',
    created: '2009-08-17T00:00:00',
  },
  distro_1237: {
    id: 'distro_1237',
    recommended: true,
    vendor: 'Debian',
    label: 'Debian 8.1',
    created: '2009-08-17T00:00:00',
  },
  distro_1238: {
    id: 'distro_1238',
    recommended: false,
    vendor: 'Debian',
    label: 'Debian 6',
    created: '2009-08-17T00:00:00',
  },
};
