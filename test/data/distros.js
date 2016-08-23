export const apiTestDistro = {
  id: 'linode/arch2016.05',
  recommended: true,
  vendor: 'Arch',
  label: 'Arch Linux 2016.05',
  created: '2009-08-17T00:00:00',
  x64: true,
  minimum_storage_size: 550,
};

export const testDistro = {
  ...apiTestDistro,
  _polling: false,
};

export const distros = {
  distro_1234: testDistro,
  distro_1235: {
    ...testDistro,
    id: 'linode/arch2015.05',
    recommended: false,
    label: 'Arch Linux 2015.05',
  },
  distro_1236: {
    ...testDistro,
    id: 'linode/debian7',
    vendor: 'Debian',
    label: 'Debian 7',
  },
  distro_1237: {
    ...testDistro,
    id: 'linode/debian8.1',
    vendor: 'Debian',
    label: 'Debian 8.1',
  },
  distro_1238: {
    ...testDistro,
    id: 'linode/debian6',
    recommended: false,
    vendor: 'Debian',
    label: 'Debian 6',
  },
};
