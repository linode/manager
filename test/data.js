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
};
