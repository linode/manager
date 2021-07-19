import { GlobalGrantTypes } from '@linode/api-v4/lib/account';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/profile';
import { ApplicationState } from 'src/store';
import { Profile } from '@linode/api-v4/lib/profile';

export const isRestrictedUser =
  queryClient.getQueryData<Profile>(queryKey)?.restricted || false;

export const hasGrant = (state: ApplicationState, grant: GlobalGrantTypes) => {
  return state?.__resources?.profile?.data?.grants?.global?.[grant] ?? false;
};
