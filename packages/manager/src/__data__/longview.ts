import { LongviewClient } from 'linode-js-sdk/lib/longview';
import {
  LongviewLoad,
  LongviewMemory,
  LongviewNetwork,
  LongviewSystemInfo
} from 'src/features/Longview/request.types';

export const longviewLoad: LongviewLoad = {
  Load: [
    {
      x: 2,
      y: 2
    }
  ]
};

export const systemInfo: LongviewSystemInfo = {
  SysInfo: {
    type: 'kvm',
    kernel: 'Linux 4.9.0-9-amd64',
    client: '1.1.5',
    os: {
      dist: 'Debian',
      distversion: '9.11'
    },
    arch: 'x86_64',
    cpu: {
      cores: 1,
      type: 'Intel(R) Xeon(R) CPU E5-2680 v3 @ 2.50GHz'
    },
    hostname: 'localhost'
  }
};

export const memory: LongviewMemory = {
  Memory: {
    real: {
      used: [
        {
          y: 5000,
          x: 500
        }
      ],
      cache: [
        {
          y: 100,
          x: 100
        }
      ],
      buffers: [
        {
          y: 100,
          x: 100
        }
      ],
      free: [
        {
          y: 2000000,
          x: 200
        }
      ]
    },
    swap: {
      free: [
        {
          y: 100,
          x: 100
        }
      ],
      used: [
        {
          y: 2000000,
          x: 100
        }
      ]
    }
  }
};

export const network: LongviewNetwork = {
  Network: {
    mac_addr: '8c:85:90:05:c2:bf',
    Interface: {
      eth0: {
        rx_bytes: [
          {
            x: 0,
            y: 131072
          }
        ],
        tx_bytes: [
          {
            x: 0,
            y: 131072
          }
        ]
      },
      eth1: {
        rx_bytes: [
          {
            x: 0,
            y: 131072
          }
        ],
        tx_bytes: [
          {
            x: 0,
            y: 131072
          }
        ]
      }
    }
  }
};

export const longviewClientFactory = (
  data: Partial<LongviewClient>
): LongviewClient => ({
  id: 1,
  apps: {
    nginx: true,
    apache: true,
    mysql: true
  },
  install_code: '123-123-123',
  created: '2019-10-10T17:16:54',
  updated: '2019-10-10T17:16:55',
  label: 'new-longview-client',
  api_key: '456-456-456',
  ...data
});

export const longviewClients = [
  longviewClientFactory({ label: 'my-client1', id: 1 }),
  longviewClientFactory({ label: 'my-client2', id: 2 }),
  longviewClientFactory({ label: 'my-client3', id: 3 })
];
