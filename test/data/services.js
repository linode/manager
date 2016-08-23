export const apiTestService = {
  hourly_price: 1,
  id: 'linode2048.5',
  label: 'Linode 2048',
  mbits_out: 125,
  monthly_price: 1000,
  ram: 2048,
  service_type: 'linode',
  storage: 24,
  transfer: 2000,
  vcpus: 1,
};

export const testService = {
  ...apiTestService,
  _polling: false,
};

export const services = {
  'linode2048.5': testService,
};
