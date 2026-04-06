import type { AccountSettings, Profile } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';
import type { FlagSet } from 'src/featureFlags';

export type RouterContext = {
  accountSettings?: AccountSettings;
  flags: FlagSet;
  globalErrors?: {
    account_unactivated?: boolean;
  };
  isACLPEnabled?: boolean;
  isDatabasesEnabled?: boolean;
  isPlacementGroupsEnabled?: boolean;
  isPrivateImageSharingEnabled?: boolean;
  profile?: Profile;
  queryClient: QueryClient;
};

export interface TableSearchParams {
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  pageSize?: number;
}
