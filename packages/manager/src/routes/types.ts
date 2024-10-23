import type { AccountSettings } from '@linode/api-v4';

export type RouterContext = {
  accountSettings?: AccountSettings;
  globalErrors?: {
    account_unactivated?: boolean;
  };
  isACLPEnabled?: boolean;
  isDatabasesEnabled?: boolean;
  isPlacementGroupsEnabled?: boolean;
};
