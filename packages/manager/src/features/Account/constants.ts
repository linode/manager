export const PARENT_USER = 'parent user';
export const ADMINISTRATOR = 'account administrator';
export const CUSTOMER_SUPPORT = 'customer support';

export const grantTypeMap = {
  account: 'Account',
  bucket: 'Buckets',
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

export const RESTRICTED_FIELD_TOOLTIP = 'This field can\u{2019}t be modified.';

// Parent User Messaging
export const PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT =
  'Remove child accounts before closing the account.';
export const PARENT_USER_SESSION_EXPIRED = `Session expired. Please log in again to your ${PARENT_USER} account.`;

// Proxy User Messaging
export const PROXY_USER_RESTRICTED_TOOLTIP_TEXT =
  'You can\u{2019}t perform this action on child accounts.';
export const PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT = `Contact ${CUSTOMER_SUPPORT} to close this account.`;

// Child User Messaging
export const CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT = `Contact your ${PARENT_USER} to close your account.`;

export const CANCELLATION_DATA_LOSS_WARNING = `This is an extremely destructive action. All services, Linodes, volumes, DNS records, and user accounts will be permanently lost.`;

export const CANCELLATION_DIALOG_TITLE =
  'Are you sure you want to close your Akamai cloud computing services account?';
