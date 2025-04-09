import {
  createChildAccountPersonalAccessToken,
  updateAccountInfo,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { useIsTaxIdEnabled } from 'src/features/Account/utils';
import { useGrants, useProfile } from 'src/queries/profile/profile';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type {
  APIError,
  Account,
  ChildAccountPayload,
  RequestOptions,
  ResourcePage,
  Token,
} from '@linode/api-v4';

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>({
    ...accountQueries.account,
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { isTaxIdEnabled } = useIsTaxIdEnabled();

  return useMutation<Account, APIError[], Partial<Account>>({
    mutationFn: updateAccountInfo,
    onSuccess(account) {
      queryClient.setQueryData<Account | undefined>(
        accountQueries.account.queryKey,
        (prevAccount) => {
          if (!prevAccount) {
            return account;
          }

          if (
            isTaxIdEnabled &&
            account.tax_id &&
            account.country !== 'US' &&
            prevAccount?.tax_id !== account.tax_id
          ) {
            enqueueSnackbar(
              "You edited the Tax Identification Number. It's being verified. You'll get an email with the verification result.",
              {
                hideIconVariant: false,
                variant: 'info',
              }
            );
            queryClient.invalidateQueries({
              queryKey: accountQueries.notifications.queryKey,
            });
          }

          return account;
        }
      );
    },
  });
};

export const useChildAccountsInfiniteQuery = (options: RequestOptions) => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const hasExplicitAuthToken = Boolean(options.headers?.Authorization);
  const enabled =
    (Boolean(profile?.user_type === 'parent') && !profile?.restricted) ||
    Boolean(grants?.global?.child_account_access) ||
    hasExplicitAuthToken;

  return useInfiniteQuery<ResourcePage<Account>, APIError[]>({
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    ...accountQueries.childAccounts(options),
  });
};

export const useCreateChildAccountPersonalAccessTokenMutation = () =>
  useMutation<Token, APIError[], ChildAccountPayload>({
    mutationFn: ({ euuid, headers }: ChildAccountPayload) =>
      createChildAccountPersonalAccessToken({ euuid, headers }),
  });
