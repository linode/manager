/* eslint-disable no-undef */
export const API_ROOT = ENV_API_ROOT || 'https://api.linode.com/v4';
export const LOGIN_ROOT = ENV_LOGIN_ROOT || 'https://login.linode.com';
export const APP_ROOT = ENV_APP_ROOT || 'http://localhost:3000';
export const GA_ID = ENV_GA_ID;
export const SENTRY_URL = ENV_SENTRY_URL;
export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const DEVTOOLS_DISABLED = ENV_DEVTOOLS_DISABLED || ENVIRONMENT === 'production';
export const VERSION = ENV_VERSION;
/* eslint-enable no-undef */

export const EVENT_POLLING_DELAY = (5 * 1000); // milliseconds

export const LinodeStates = {
  pending: [
    'booting',
    'rebooting',
    'shutting_down',
    'migrating',
    'provisioning',
    'deleting',
    'rebuilding',
    'restoring',
    'cloning',
  ],
};

export const REGION_MAP = {
  'North America': ['us-east-1a', 'us-south-1a', 'us-west-1a', 'us-southeast-1a'],
  Europe: ['eu-central-1a', 'eu-west-1a'],
  Asia: ['ap-northeast-1a', 'ap-south-1a', 'ap-northeast-1b'],
};

// Still necessary for older DNS lookups.
export const ZONES = {
  'us-east-1a': 'newark',
  'us-south-1a': 'dallas',
  'us-west-1a': 'fremont',
  'us-southeast-1a': 'atlanta',
  'eu-central-1a': 'frankfurt',
  'eu-west-1a': 'london',
  'ap-northeast-1a': 'tokyo',
  'ap-northeast-1b': 'shinagawa1',
  'ap-south-1a': 'singapore',
};

export const UNAVAILABLE_ZONES = ['ap-northeast-1a'];

export const LinodeStatesReadable = {
  shutting_down: 'Powering Off',
  contact_support: 'Error',
  offline: 'Offline',
  running: 'Running',
  booting: 'Powering On',
  provisioning: 'Provisioning',
  rebooting: 'Rebooting',
  rebuilding: 'Powering Off',
  restoring: 'Restoring',
};

export const NodebalancerStatusReadable = {
  active: 'Active',
  suspended: 'Suspended',
  canceled: 'Canceled',
  new_active: 'Active',
  new_suspended: 'Suspended',
};

export const ipv4ns = {
  'us-south-1a': [
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
  'us-west-1a': [
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
  'us-southeast-1a': [
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
  'us-east-1a': [
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
  'eu-west-1a': [
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
  'eu-central-1a': [
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
  'ap-northeast-1a': [
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
  'ap-northeast-1b': [
    '139.162.66.5',
    '139.162.67.5',
    '139.162.68.5',
    '139.162.69.5',
    '139.162.70.5',
    '139.162.71.5',
    '139.162.72.5',
    '139.162.73.5',
    '139.162.74.5',
    '139.162.75.5'],
  'ap-south-1a': [
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
};

export const ipv6ns = {
  'us-south-1a': '2600:3c00::',
  'us-west-1a': '2600:3c01::',
  'us-southeast-1a': '2600:3c02::',
  'us-east-1a': '2600:3c03::',
  'eu-west-1a': '2a01:7e00::',
  'eu-central-1a': '2a01:7e01::',
  'ap-northeast-1a': '2400:8900::',
  'ap-northeast-1b': '2400:8902::',
  'ap-south-1a': '2400:8901::',
};

export const ipv6nsSuffix = ['5', '6', '7', '8', '9', 'b', 'c'];

export const NAME_SERVERS = [
  'ns1.linode.com', 'ns2.linode.com', 'ns3.linode.com', 'ns4.linode.com', 'ns5.linode.com',
];

export const OAUTH_SUBSCOPES = ['view', 'modify', 'create', 'delete'];

export const OAUTH_SCOPES = [
  'linodes', 'domains', 'nodebalancers', 'images', 'stackscripts', 'longview', 'events', 'tokens',
  'clients', 'account', 'users', 'tickets', 'ips', 'volumes',
];

// Set by API, but we can enforce it here to be nice.
export const MAX_UPLOAD_SIZE_MB = 5;

export const GRAVATAR_BASE_URL = 'https://gravatar.com/avatar/';

export const NODEBALANCER_CONFIG_ALGORITHMS = new Map([
  ['roundrobin', 'Round Robin'],
  ['leastconn', 'Least Connections'],
  ['source', 'Source IP'],
]);

export const NODEBALANCER_CONFIG_STICKINESS = new Map([
  ['none', '-- None --'],
  ['table', 'Table'],
  ['http_cookie', 'HTTP Cookie'],
]);

export const NODEBALANCER_CONFIG_CHECKS = new Map([
  ['connection', 'TCP Connection'],
  ['http', 'HTTP Valid Status'],
  ['http_body', 'HTTP Body Regex'],
]);

export const AVAILABLE_DISK_SLOTS = {
  kvm: [...'abcdefgh'].map(letter => `sd${letter}`),
  xen: [...'abcdefgh'].map(letter => `xvd${letter}`),
};

export const IPV4_DNS_RESOLVERS = [
  '66.228.42.5',
  '96.126.106.5',
  '50.116.53.5',
  '50.116.58.5',
  '50.116.61.5',
  '50.116.62.5',
  '66.175.211.5',
  '97.107.133.4',
  '207.192.69.4',
  '207.192.69.5',
];

export const IPV6_DNS_RESOLVERS = [
  '2600:3c03::5',
  '2600:3c03::6',
  '2600:3c03::7',
  '2600:3c03::8',
  '2600:3c03::9',
  '2600:3c03::b',
  '2600:3c03::c',
];

export const MONTHLY_IP_COST = 1;

export const DISTRIBUTION_DISPLAY_ORDER = [
  'ubuntu', 'debian', 'centos', 'fedora', 'arch', 'opensuse', 'gentoo', 'slackware',
];

export const DEFAULT_DISTRIBUTION = 'linode/Ubuntu16.04LTS';
