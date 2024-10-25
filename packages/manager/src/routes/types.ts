import type { AccountSettings, Params } from '@linode/api-v4';

export type RouterContext = {
  accountSettings?: AccountSettings;
  globalErrors?: {
    account_unactivated?: boolean;
  };
  isACLPEnabled?: boolean;
  isDatabasesEnabled?: boolean;
  isPlacementGroupsEnabled?: boolean;
};

export interface TableSearchParams extends Params {
  order?: 'asc' | 'desc';
  orderBy?: string;
}
