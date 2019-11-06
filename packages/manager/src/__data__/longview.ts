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
