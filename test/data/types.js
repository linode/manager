export const apiTestType = {
  hourly_price: 0.015,
  id: 'linode2048.5',
  label: 'Linode 2048',
  mbits_out: 125,
  monthly_price: 10,
  ram: 2048,
  service_type: 'linode',
  storage: 24576,
  transfer: 2000,
  vcpus: 2,
  backups_price: 2.5,
  class: 'standard',
};

export const testType = {
  ...apiTestType,
  _polling: false,
};

export const types = {
  'linode1024.5': {
    hourly_price: 0.0075,
    id: 'linode1024.5',
    label: 'Linode 1024',
    mbits_out: 125,
    monthly_price: 5.0,
    ram: 1024,
    service_type: 'linode',
    storage: 24576,
    transfer: 1000,
    vcpus: 1,
    backups_price: 2.0,
    class: 'standard',
  },
  'linode2048.5': testType,
};
