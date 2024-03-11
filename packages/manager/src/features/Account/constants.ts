export const PARENT_USER = 'parent user';
export const ADMINISTRATOR = 'account administrator';
export const CUSTOMER_SUPPORT = 'customer support';

export const grantTypeMap = {
  account: 'Account',
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

export const PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT =
  'Remove child accounts before closing the account.';
export const CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT = `Contact your ${PARENT_USER} to close your account.`;
export const PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT = `Contact ${CUSTOMER_SUPPORT} to close this account.`;
export const PARENT_SESSION_EXPIRED = `Session expired. Please log in again to your ${PARENT_USER} account.`;
export const PROXY_RESTRICTED_PAT_TOOLTIP_TEXT = `You can't create access tokens for child accounts. Instead, switch to your account and create the token there.`;
export const RESTRICTED_FIELD_TOOLTIP =
  'This account type cannot update this field.';
