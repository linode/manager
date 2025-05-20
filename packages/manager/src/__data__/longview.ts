import type { LongviewClient } from '@linode/api-v4/lib/longview';
import type {
  LongviewLoad,
  LongviewMemory,
  LongviewNetwork,
  LongviewSystemInfo,
} from 'src/features/Longview/request.types';

export const longviewLoad: LongviewLoad = {
  Load: [
    {
      x: 2,
      y: 2,
    },
  ],
};

export const systemInfo: LongviewSystemInfo = {
  SysInfo: {
    arch: 'x86_64',
    client: '1.1.5',
    cpu: {
      cores: 1,
      type: 'Intel(R) Xeon(R) CPU E5-2680 v3 @ 2.50GHz',
    },
    hostname: 'localhost',
    kernel: 'Linux 4.9.0-9-amd64',
    os: {
      dist: 'Debian',
      distversion: '9.11',
    },
    type: 'kvm',
  },
};

export const memory: LongviewMemory = {
  Memory: {
    real: {
      buffers: [
        {
          x: 100,
          y: 100,
        },
      ],
      cache: [
        {
          x: 100,
          y: 100,
        },
      ],
      free: [
        {
          x: 200,
          y: 2000000,
        },
      ],
      used: [
        {
          x: 500,
          y: 5000,
        },
      ],
    },
    swap: {
      free: [
        {
          x: 100,
          y: 100,
        },
      ],
      used: [
        {
          x: 100,
          y: 2000000,
        },
      ],
    },
  },
};

export const network: LongviewNetwork = {
  Network: {
    Interface: {
      eth0: {
        rx_bytes: [
          {
            x: 0,
            y: 131072,
          },
        ],
        tx_bytes: [
          {
            x: 0,
            y: 131072,
          },
        ],
      },
      eth1: {
        rx_bytes: [
          {
            x: 0,
            y: 131072,
          },
        ],
        tx_bytes: [
          {
            x: 0,
            y: 131072,
          },
        ],
      },
    },
    mac_addr: '8c:85:90:05:c2:bf',
  },
};

export const longviewClientFactory = (
  data: Partial<LongviewClient>
): LongviewClient => ({
  api_key: '456-456-456',
  apps: {
    apache: true,
    mysql: true,
    nginx: true,
  },
  created: '2019-10-10T17:16:54',
  id: 1,
  install_code: '123-123-123',
  label: 'new-longview-client',
  updated: '2019-10-10T17:16:55',
  ...data,
});

export const longviewClients = [
  longviewClientFactory({ id: 1, label: 'my-client1' }),
  longviewClientFactory({ id: 2, label: 'my-client2' }),
  longviewClientFactory({ id: 3, label: 'my-client3' }),
];
