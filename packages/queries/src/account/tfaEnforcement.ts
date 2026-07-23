import {
  getTfaEnforcementAccountSettings,
  getTfaOptionalUsers,
  updateTfaEnforcementAccountSettings,
  updateTfaOptionalUsers,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryPresets } from '../base';

import type {
  AccountSettings,
  APIError,
  Filter,
  Params,
  ResourcePage,
  TfaOptionalUser,
  UpdateTfaOptionalUsersPayload,
  UpdateTfaOptionalUsersResponse,
} from '@linode/api-v4';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export const tfaEnforcementQueries = createQueryKeys('tfa-enforcement', {
  settings: {
    queryFn: getTfaEnforcementAccountSettings,
    queryKey: null,
  },
  tfaOptionalUsers: {
    contextQueries: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getTfaOptionalUsers(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

/**
 * Account settings including `tfa_enforced` (beta).
 * - GET /v4beta/account/settings
 */
export const useGetTfaEnforcementAccountSettingsQuery = (
  enabled = true,
): UseQueryResult<AccountSettings, APIError[]> =>
  useQuery({
    ...tfaEnforcementQueries.settings,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

/**
 * Update account-level 2FA enforcement policy (beta).
 * - PUT /v4beta/account/settings
 */
export const useUpdateTfaEnforcementAccountSettingsMutation =
  (): UseMutationResult<
    AccountSettings,
    APIError[],
    Partial<AccountSettings>
  > => {
    const queryClient = useQueryClient();

    return useMutation<AccountSettings, APIError[], Partial<AccountSettings>>({
      mutationFn: updateTfaEnforcementAccountSettings,
      onSuccess(newData) {
        queryClient.setQueryData<AccountSettings>(
          tfaEnforcementQueries.settings.queryKey,
          (oldData) => ({
            ...oldData!,
            ...newData,
          }),
        );
      },
    });
  };

/**
 * List users for whom 2FA is optional (exempt from account-level TFA enforcement).
 * - GET /v4beta/account/tfa-optional-users
 */
export const useGetTfaOptionalUsersQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
): UseQueryResult<ResourcePage<TfaOptionalUser>, APIError[]> =>
  useQuery({
    ...tfaEnforcementQueries.tfaOptionalUsers._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * Replace the list of users for whom 2FA is optional.
 * - PUT /v4beta/account/tfa-optional-users
 */
export const useUpdateTfaOptionalUsersMutation = (): UseMutationResult<
  UpdateTfaOptionalUsersResponse,
  APIError[],
  UpdateTfaOptionalUsersPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTfaOptionalUsersResponse,
    APIError[],
    UpdateTfaOptionalUsersPayload
  >({
    mutationFn: updateTfaOptionalUsers,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: tfaEnforcementQueries.tfaOptionalUsers.queryKey,
      });
    },
  });
};
