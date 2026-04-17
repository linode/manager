// Various constants for the Databases

// Copy
export const ACCESS_CONTROLS_DRAWER_TEXT =
  'Add, edit, or remove IPv6 (recommended) or IPv4 addresses or ranges that should be authorized to access your cluster.';
export const ACCESS_CONTROLS_DRAWER_TEXT_LEGACY =
  'Add, edit, or remove IPv4 addresses and ranges that should be authorized to access your cluster.';

export const ACCESS_CONTROLS_IN_SETTINGS_TEXT =
  'Add or remove IPv6 (recommended) or IPv4 addresses or ranges that should be authorized to access your cluster.';
export const ACCESS_CONTROLS_IN_SETTINGS_TEXT_LEGACY =
  'Add or remove IPv4 addresses or ranges that should be authorized to access your cluster.';

export const ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT =
  'Must be a valid IPv6 or IPv4 address.';

export const ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT_LEGACY =
  'Must be a valid IPv4 address.';

export const SUSPEND_CLUSTER_TEXT = `Suspend the cluster if you don't use it temporarily to prevent being billed for it.`;

export const RESET_ROOT_PASSWORD_TEXT =
  'Reset your root password if someone should no longer have access to the root user or if you believe your password may have been compromised. This will automatically generate a new password that you’ll be able to see on your database cluster summary page.';
export const RESET_ROOT_PASSWORD_TEXT_LEGACY =
  'Resetting your root password will automatically generate a new password. You can view the updated password on your database cluster summary page. ';

export const DELETE_CLUSTER_TEXT =
  'Permanently remove an unused database cluster.';
export const DELETE_CLUSTER_TEXT_LEGACY =
  'Deleting a database cluster is permanent and cannot be undone.';

export const ADVANCED_CONFIG_INFO =
  'There is no way to reset advanced configuration options to default. Options that you add cannot be removed. Changing or adding some options causes the service to restart.';

export const RESIZE_DISABLED_PREMIUM_PLAN_TAB_TEXT =
  'Resizing to a Premium CPU plan is not available for database clusters on a Shared CPU or a Dedicated CPU plan.';

export const RESIZE_DISABLED_DEDICATED_SHARED_PLAN_TABS_TEXT =
  'Resizing to a Shared CPU or a Dedicated CPU plan is not available for database clusters on a Premium CPU plan.';

export const RESIZE_DISABLED_NON_G7_DEDICATED_SHARED_PLAN_TABS_TEXT =
  'Resizing to a Shared CPU or a non-G7 Dedicated CPU plan is not available for database clusters on a Premium CPU plan.';

export const BACKUPS_MAX_TIME_EXCEEDED_VALIDATON_TEXT =
  'Select a time from the past.';

export const BACKUPS_MIN_TIME_EXCEEDED_VALIDATON_TEXT =
  'No backup available for this point in time. Select a later time.';

export const BACKUPS_INVALID_TIME_VALIDATON_TEXT =
  'Specify the exact time in the format: hh:mm:ss.';

export const BACKUPS_UNABLE_TO_RESTORE_TEXT =
  'You can restore a backup after the first backup is completed.';

export const SUMMARY_HOST_TOOLTIP_COPY =
  'Use the IPv6 address (AAAA record) for this hostname to avoid network transfer charges when connecting to this database from Linodes within the same region.';

export const SUMMARY_PRIVATE_HOST_COPY =
  "Private hostnames resolve to internal IP addresses and can only be used to access the database cluster from other Linode instances within the same VPC. This connection is secured and doesn't incur transfer costs.";

export const SUMMARY_PRIVATE_HOST_LEGACY_COPY =
  'A private network host and a private IP can only be used to access a Database Cluster from Linodes in the same data center and will not incur transfer costs.';

export const CREDENTIALS_ERROR_TEXT =
  'There was an error retrieving cluster credentials. Please try again.';

export const DISABLED_PASSWORD_BUTTON_TEXT =
  'Your root password is unavailable when your Database Cluster is in a suspended or resuming state.';

export const CLUSTER_PROVISIONING_TEXT =
  'Your Database Cluster is currently provisioning.';

// Links
export const LEARN_MORE_LINK_LEGACY =
  'https://techdocs.akamai.com/cloud-computing/docs/manage-access-controls';
export const LEARN_MORE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#ipv6-support';
export const ADVANCED_CONFIG_LEARN_MORE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/advanced-configuration-parameters';
export const MANAGE_NETWORKING_LEARN_MORE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#manage-networking';
export const MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#manage-pgbouncer-connection-pools';

// Styles
export const CONNECTION_POOL_LABEL_CELL_STYLES = {
  flex: '.5 1 20.5%',
};

export const poolModeOptions = [
  { label: 'Transaction', value: 'transaction' },
  { label: 'Session', value: 'session' },
  { label: 'Statement', value: 'statement' },
];

export const DEFAULT_PAGE_SIZES = [25, 50, 75, 100];
export const DISABLE_CREDENTIAL_STATES = [
  'provisioning',
  'resuming',
  'suspending',
  'suspended',
];
