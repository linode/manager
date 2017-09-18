export const apiTestDistro = {
  id: 'linode/arch2016.05',
  recommended: true,
  vendor: 'Arch',
  label: 'Arch Linux 2016.05',
  updated: '2009-08-17T00:00:00',
  architecture: 'x86_64',
  disk_minimum: 550,
};

export const testDistro = {
  ...apiTestDistro,
  _polling: false,
};

export const distributions = {
  'linode/arch2016.05': testDistro,
  'linode/debian7': {
    ...testDistro,
    id: 'linode/debian7',
    vendor: 'Debian',
    label: 'Debian 7',
  },
  'linode/debian8.1': {
    ...testDistro,
    id: 'linode/debian8.1',
    vendor: 'Debian',
    label: 'Debian 8.1',
  },
  'linode/debian6': {
    ...testDistro,
    id: 'linode/debian6',
    recommended: false,
    vendor: 'Debian',
    label: 'Debian 6',
  },
};
