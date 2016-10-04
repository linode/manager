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
};

export const testType = {
  ...apiTestType,
  _polling: false,
};

export const types = {
  'linode2048.5': testType,
};
