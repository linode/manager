import { LinodeIPsResponse } from 'linode-js-sdk/lib/linodes';

export const ipResponse: LinodeIPsResponse = {
  ipv4: {
    private: [
      {
        address: '192.168.0.1',
        gateway: null,
        linode_id: 23456,
        prefix: 17,
        public: false,
        rdns: null,
        region: 'us-central',
        subnet_mask: '255.255.128.0',
        type: 'ipv4'
      },
      {
        address: '192.168.0.1',
        gateway: null,
        linode_id: 123456,
        prefix: 17,
        public: false,
        rdns: null,
        region: 'us-central',
        subnet_mask: '255.255.128.0',
        type: 'ipv4'
      }
    ],
    public: [
      {
        address: '198.51.100.1',
        gateway: '198.51.100.2',
        linode_id: 123456,
        prefix: 24,
        public: true,
        rdns: 'li1612-253.members.linode.com',
        region: 'ap-south',
        subnet_mask: '255.255.255.0',
        type: 'ipv4'
      },
      {
        address: '198.51.100.5',
        gateway: null,
        linode_id: 1233456,
        prefix: 24,
        public: true,
        rdns: 'li1612-253.members.linode.com',
        region: 'ap-south',
        subnet_mask: '255.255.255.0',
        type: 'ipv4'
      }
    ],
    reserved: [],
    shared: [
      {
        address: '192.168.0.1',
        gateway: null,
        linode_id: 453211,
        prefix: 17,
        public: false,
        rdns: null,
        region: 'us-central',
        subnet_mask: '255.255.128.0',
        type: 'ipv4'
      },
      {
        address: '192.168.0.1',
        gateway: null,
        linode_id: 23134,
        prefix: 17,
        public: false,
        rdns: null,
        region: 'ap-south',
        subnet_mask: '255.255.128.0',
        type: 'ipv4'
      },
      {
        address: '192.168.0.2',
        gateway: null,
        linode_id: 143221,
        prefix: 17,
        public: false,
        rdns: null,
        region: 'eu-central',
        subnet_mask: '255.255.128.0',
        type: 'ipv4'
      }
    ]
  },
  ipv6: {
    global: [],
    link_local: {
      address: 'fe81::f04d:95ff:fe7e:c3ba',
      gateway: 'fe81::1',
      linode_id: 13423412,
      prefix: 64,
      public: false,
      rdns: null,
      region: 'ap-south',
      subnet_mask: 'ffff:ffff:ffff:ffff::',
      type: 'ipv6'
    },
    slaac: {
      address: '2401:8931::f04c:92ff:fc7e:c6ba',
      gateway: 'fe80::1',
      linode_id: 3523113,
      prefix: 64,
      public: true,
      rdns: null,
      region: 'ap-south',
      subnet_mask: 'ffff:ffff:ffff:ffff::',
      type: 'ipv6'
    }
  }
};
