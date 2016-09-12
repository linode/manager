export const API_ROOT = ENV_API_ROOT || 'https://api.alpha.linode.com/v4'; // eslint-disable-line no-undef
export const LOGIN_ROOT = ENV_LOGIN_ROOT || 'https://login.alpha.linode.com'; // eslint-disable-line no-undef
export const APP_ROOT = ENV_APP_ROOT || 'http://localhost:3000'; // eslint-disable-line no-undef

export const LinodeStates = {
  pending: [
    'booting',
    'rebooting',
    'shutting_down',
    'migrating',
    'provisioning',
    'deleting',
  ],
};

export const regionMap = {
  'North America': ['newark'],
  Europe: ['frankfurt', 'london'],
  Asia: ['singapore'],
};

export const LinodeStatesReadable = {
  shutting_down: 'Shutting off',
  offline: 'Offline',
  running: 'Running',
  booting: 'Booting',
  provisioning: 'Provisioning',
  rebooting: 'Rebooting',
};

export const BackupStatus = {
  pending: [
    'pending',
    'running',
    'needsPostProcessing',
  ],
};


export const ipv4ns = {
  dallas: [
    '173.255.199.5',
    '66.228.53.5',
    '96.126.122.5',
    '96.126.124.5',
    '96.126.127.5',
    '198.58.107.5',
    '198.58.111.5',
    '23.239.24.5',
    '72.14.179.5',
    '72.14.188.5'],
  fremont: [
    '173.230.145.5',
    '173.230.147.5',
    '173.230.155.5',
    '173.255.212.5',
    '173.255.219.5',
    '173.255.241.5',
    '173.255.243.5',
    '173.255.244.5',
    '74.207.241.5',
    '74.207.242.5'],
  atlanta: [
    '173.230.129.5',
    '173.230.136.5',
    '173.230.140.5',
    '66.228.59.5',
    '66.228.62.5',
    '50.116.35.5',
    '50.116.41.5',
    '23.239.18.5',
    '75.127.97.6',
    '75.127.97.7'],
  newark: [
    '66.228.42.5',
    '96.126.106.5',
    '50.116.53.5',
    '50.116.58.5',
    '50.116.61.5',
    '50.116.62.5',
    '66.175.211.5',
    '97.107.133.4',
    '207.192.69.4',
    '207.192.69.5'],
  london: [
    '178.79.182.5',
    '176.58.107.5',
    '176.58.116.5',
    '176.58.121.5',
    '151.236.220.5',
    '212.71.252.5',
    '212.71.253.5',
    '109.74.192.20',
    '109.74.193.20',
    '109.74.194.20'],
  tokyo: [
    '106.187.90.5',
    '106.187.93.5',
    '106.187.94.5',
    '106.187.95.5',
    '106.186.116.5',
    '106.186.123.5',
    '106.186.124.5',
    '106.187.34.20',
    '106.187.35.20',
    '106.187.36.20'],
  singapore: [
    '139.162.11.5',
    '139.162.13.5',
    '139.162.14.5',
    '139.162.15.5',
    '139.162.16.5',
    '139.162.21.5',
    '139.162.27.5',
    '103.3.60.18',
    '103.3.60.19',
    '103.3.60.20'],
  frankfort: [
    '139.162.130.5',
    '139.162.131.5',
    '139.162.132.5',
    '139.162.133.5',
    '139.162.134.5',
    '139.162.135.5',
    '139.162.136.5',
    '139.162.137.5',
    '139.162.138.5',
    '139.162.139.5'],
};
export const ipv6ns = {
  dallas: '2600:3c00::',
  fremont: '2600:3c01::',
  atlanta: '2600:3c02::',
  newark: '2600:3c03::',
  london: '2a01:7e00::',
  tokyo: '2400:8900::',
  singapore: '2400:8901::',
  frankfort: '2a01:7e01::',
};
export const ipv6nsSuffix = ['5', '6', '7', '8', '9', 'b', 'c'];
