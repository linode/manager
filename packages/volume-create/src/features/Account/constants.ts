export const PARENT_USER = 'parent user';
export const ADMINISTRATOR = 'account administrator';
const CUSTOMER_SUPPORT = 'customer support';

export const grantTypeMap = {
  account: 'Account',
  database: 'Databases',
  domain: 'Domains',
  firewall: 'Firewalls',
  image: 'Images',
  linode: 'Linodes',
  lkeCluster: 'LKE Clusters', // Note: Not included in the user's grants returned from the API.
  longview: 'Longview Clients',
  nodebalancer: 'NodeBalancers',
  placementGroups: 'Placement Groups',
  stackscript: 'StackScripts',
  volume: 'Volumes',
  vpc: 'VPCs',
} as const;

const RESTRICTED_FIELD_TOOLTIP = 'This field can\u{2019}t be modified.';

// Parent User Messaging
const PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT =
  'Remove child accounts before closing the account.';
const PARENT_USER_SESSION_EXPIRED = `Session expired. Please log in again to your ${PARENT_USER} account.`;

// Proxy User Messaging
const PROXY_USER_RESTRICTED_TOOLTIP_TEXT =
  'You can\u{2019}t perform this action on child accounts.';
const PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT = `Contact ${CUSTOMER_SUPPORT} to close this account.`;

// Child User Messaging
const CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT = `Contact your ${PARENT_USER} to close your account.`;
