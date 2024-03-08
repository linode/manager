export const BUSINESS_PARTNER = 'business partner';
export const ADMINISTRATOR = 'account administrator';

export const grantTypeMap = {
  account: 'Account',
  database: 'Databases',
  domain: 'Domains',
  firewall: 'Firewalls',
  image: 'Images',
  linode: 'Linodes',
  longview: 'Longview Clients',
  nodebalancer: 'NodeBalancers',
  placementGroups: 'PlacementGroups',
  stackscript: 'StackScripts',
  volume: 'Volumes',
  vpc: 'VPCs',
} as const;

export const PARENT_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT =
  'Remove indirect customers before closing the account.';
export const CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT =
  'Contact your business partner to close your account.';

// TODO: Parent/Child: Requires updated copy...
export const PARENT_SESSION_EXPIRED =
  'Session expired. Please log in again to your business partner account.';

export const RESTRICTED_FIELD_TOOLTIP =
  'This account type cannot update this field.';
