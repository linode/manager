import type { AccountSettings } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';
import type { FlagSet } from 'src/featureFlags';

export type RouterContext = {
  accountSettings?: AccountSettings;
  flags: FlagSet;
  isAccountUnactivated: boolean;
  isACLPEnabled?: boolean;
  isDatabasesEnabled?: boolean;
  isPlacementGroupsEnabled?: boolean;
  queryClient: QueryClient;
};

export interface TableSearchParams {
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  pageSize?: number;
}
