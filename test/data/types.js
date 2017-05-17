export const apiTestType = {
  hourly_price: 1,
  id: 'linode2048.5',
  label: 'Linode 2048',
  mbits_out: 125,
  monthly_price: 1000,
  ram: 2048,
  service_type: 'linode',
  storage: 24576,
  transfer: 2000,
  vcpus: 2,
  backups_price: 250,
  class: 'standard',
};

export const testType = {
  ...apiTestType,
  _polling: false,
};

export const types = {
  'linode1024.5': {
    hourly_price: 1,
    id: 'linode1024.5',
    label: 'Linode 1024',
    mbits_out: 125,
    monthly_price: 500,
    ram: 1024,
    service_type: 'linode',
    storage: 24576,
    transfer: 1000,
    vcpus: 1,
    backups_price: 150,
    class: 'standard',
  },
  'linode2048.5': testType,
};
