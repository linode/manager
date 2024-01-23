export const BUSINESS_PARTNER = 'business partner';
export const ADMINISTRATOR = 'administrator';
export const RESTRICTED_ACCESS_NOTICE = `Access restricted. Please contact your account ${ADMINISTRATOR} to request the necessary permissions.`;

export const grantTypeMap = {
  database: 'Databases',
  domain: 'Domains',
  firewall: 'Firewalls',
  image: 'Images',
  linode: 'Linodes',
  longview: 'Longview Clients',
  nodebalancer: 'NodeBalancers',
  stackscript: 'StackScripts',
  volume: 'Volumes',
  vpc: 'VPCs',
} as const;
