import { LinodeType } from 'linode-js-sdk/lib/linodes';

export const types: LinodeType[] = [
  {
    transfer: 2000,
    network_out: 1000,
    price: {
      monthly: 10.0,
      hourly: 0.015
    },
    id: 'g5-standard-1',
    label: 'Linode 2048',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 2.5,
          hourly: 0.004
        }
      }
    },
    successor: null,
    memory: 2048,
    vcpus: 1,
    disk: 30720
  },
  {
    transfer: 3000,
    network_out: 1000,
    price: {
      monthly: 20.0,
      hourly: 0.03
    },
    id: 'g5-standard-2',
    label: 'Linode 4096',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 5.0,
          hourly: 0.008
        }
      }
    },
    successor: null,
    memory: 4096,
    vcpus: 2,
    disk: 49152
  },
  {
    transfer: 4000,
    network_out: 1000,
    price: {
      monthly: 40.0,
      hourly: 0.06
    },
    id: 'g5-standard-4',
    label: 'Linode 8192',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 10.0,
          hourly: 0.015
        }
      }
    },
    successor: null,
    memory: 8192,
    vcpus: 4,
    disk: 98304
  },
  {
    transfer: 8000,
    network_out: 1000,
    price: {
      monthly: 80.0,
      hourly: 0.12
    },
    id: 'g5-standard-6',
    label: 'Linode 12288',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 20.0,
          hourly: 0.03
        }
      }
    },
    successor: null,
    memory: 12288,
    vcpus: 6,
    disk: 196608
  },
  {
    transfer: 16000,
    network_out: 2000,
    price: {
      monthly: 160.0,
      hourly: 0.24
    },
    id: 'g5-standard-8',
    label: 'Linode 24576',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 40.0,
          hourly: 0.06
        }
      }
    },
    successor: null,
    memory: 24576,
    vcpus: 8,
    disk: 393216
  },
  {
    transfer: 20000,
    network_out: 4000,
    price: {
      monthly: 320.0,
      hourly: 0.48
    },
    id: 'g5-standard-12',
    label: 'Linode 49152',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 80.0,
          hourly: 0.12
        }
      }
    },
    successor: null,
    memory: 49152,
    vcpus: 12,
    disk: 786432
  },
  {
    transfer: 20000,
    network_out: 6000,
    price: {
      monthly: 480.0,
      hourly: 0.72
    },
    id: 'g5-standard-16',
    label: 'Linode 65536',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 120.0,
          hourly: 0.18
        }
      }
    },
    successor: null,
    memory: 65536,
    vcpus: 16,
    disk: 1179648
  },
  {
    transfer: 20000,
    network_out: 8000,
    price: {
      monthly: 640.0,
      hourly: 0.96
    },
    id: 'g5-standard-20',
    label: 'Linode 81920',
    class: 'standard',
    addons: {
      backups: {
        price: {
          monthly: 160.0,
          hourly: 0.24
        }
      }
    },
    successor: null,
    memory: 81920,
    vcpus: 20,
    disk: 1572864
  },
  {
    transfer: 1000,
    network_out: 1000,
    price: {
      monthly: 5.0,
      hourly: 0.0075
    },
    id: 'g5-nanode-1',
    label: 'Linode 1024',
    class: 'nanode',
    addons: {
      backups: {
        price: {
          monthly: 2.0,
          hourly: 0.003
        }
      }
    },
    successor: null,
    memory: 1024,
    vcpus: 1,
    disk: 20480
  },
  {
    transfer: 5000,
    network_out: 1000,
    price: {
      monthly: 60.0,
      hourly: 0.09
    },
    id: 'g5-highmem-1',
    label: 'Linode 16384',
    class: 'highmem',
    addons: {
      backups: {
        price: {
          monthly: 5.0,
          hourly: 0.008
        }
      }
    },
    successor: null,
    memory: 16384,
    vcpus: 1,
    disk: 20480
  },
  {
    transfer: 6000,
    network_out: 1500,
    price: {
      monthly: 120.0,
      hourly: 0.18
    },
    id: 'g5-highmem-2',
    label: 'Linode 32768',
    class: 'highmem',
    addons: {
      backups: {
        price: {
          monthly: 10.0,
          hourly: 0.015
        }
      }
    },
    successor: null,
    memory: 32768,
    vcpus: 2,
    disk: 40960
  },
  {
    transfer: 7000,
    network_out: 3000,
    price: {
      monthly: 240.0,
      hourly: 0.36
    },
    id: 'g5-highmem-4',
    label: 'Linode 61440',
    class: 'highmem',
    addons: {
      backups: {
        price: {
          monthly: 20.0,
          hourly: 0.03
        }
      }
    },
    successor: null,
    memory: 61440,
    vcpus: 4,
    disk: 92160
  },
  {
    transfer: 8000,
    network_out: 6000,
    price: {
      monthly: 480.0,
      hourly: 0.72
    },
    id: 'g5-highmem-8',
    label: 'Linode 102400',
    class: 'highmem',
    addons: {
      backups: {
        price: {
          monthly: 40.0,
          hourly: 0.06
        }
      }
    },
    successor: null,
    memory: 102400,
    vcpus: 8,
    disk: 204800
  },
  {
    transfer: 9000,
    network_out: 10000,
    price: {
      monthly: 960.0,
      hourly: 1.44
    },
    id: 'g5-highmem-16',
    label: 'Linode 204800',
    class: 'highmem',
    addons: {
      backups: {
        price: {
          monthly: 60.0,
          hourly: 0.09
        }
      }
    },
    successor: null,
    memory: 204800,
    vcpus: 16,
    disk: 348160
  }
];
