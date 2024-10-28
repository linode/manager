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

export interface TableSearchParams {
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  page_size?: number;
}
