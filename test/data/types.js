export const apiTestType = {
  id: 'linode2048.5',
  label: 'Linode 2048',
  network_out: 125,
  memory: 2048,
  service_type: 'linode',
  disk: 24576,
  transfer: 2000,
  vcpus: 2,
  addons: { backups: { price: { monthly: 2.5, hourly: 0.015 } } },
  class: 'standard',
};

export const testType = {
  ...apiTestType,
  _polling: false,
};

export const types = {
  'g5-nanode-1': {
    network_out: 1000,
    addons: { backups: { price: { monthly: 2.0, hourly: 0.0075 } } },
    id: 'g5-nanode-1',
    disk: 20480,
    memory: 1024,
    class: 'nanode',
    transfer: 1000,
    vcpus: 1,
    label: 'Linode 1024',
  },
  'linode1024.5': {
    id: 'linode1024.5',
    label: 'Linode 1024',
    network_out: 125,
    memory: 1024,
    service_type: 'linode',
    disk: 24576,
    transfer: 1000,
    vcpus: 1,
    addons: { backups: { price: { monthly: 2.0, hourly: 0.0075 } } },
    class: 'standard',
  },
  'linode2048.5': testType,
  'g5-highmem-1': {
    network_out: 1000,
    addons: { backups: { price: { monthly: 5.0, hourly: 0.09 } } },
    id: 'g5-highmem-1',
    disk: 20480,
    memory: 16384,
    class: 'highmem',
    transfer: 5000,
    vcpus: 1,
    label: 'Linode 16384',
  },
};
