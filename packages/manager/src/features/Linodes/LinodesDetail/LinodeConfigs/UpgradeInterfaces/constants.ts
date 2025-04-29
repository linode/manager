export const CONFIG_SELECT_DRY_RUN_COPY =
  'This Linode has multiple configuration profiles. Please select a configuration profile to proceed. The upgrade dry run will identify any issues that may occur before upgrading.';

export const CONFIG_SELECT_ACTUAL_UPGRADE_COPY =
  'This Linode has multiple configuration profiles. Please select a configuration profile to upgrade. The upgrade will reassign the network interfaces from the configuration profile to the Linode.';

export const UPGRADE_INTERFACES_WARNING =
  'Once the network interfaces have been reassigned to the Linode, it will no longer be possible to use legacy configuration profiles.';

export const SUCCESS_DRY_RUN_COPY = 'Dry Run Successful';
export const SUCCESS_UPGRADE_COPY = 'The configuration upgrade was successful.';

export const ERROR_DRY_RUN_COPY =
  'The dry run found the following issues. After correcting them, perform another dry run.';

export const DEFAULT_UPGRADE_BUTTON_HELPER_TEXT =
  'Upgrade to Linode interfaces to connect the interface to the Linode not the Configuration Profile. You can perform a dry run to identify any issues before upgrading.';
