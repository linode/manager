import {
  createSSHKey,
  deleteSSHKey,
  deleteTrustedDevice,
  disableTwoFactor,
  getAppTokens,
  getPersonalAccessTokens,
  getProfile,
  getSecurityQuestions,
  getSSHKeys,
  getTrustedDevices,
  getUserPreferences,
  listGrants,
  sendCodeToPhoneNumber,
  smsOptOut,
  updateProfile,
  updateSSHKey,
  verifyPhoneNumberCode,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { accountQueries } from '../account/queries';
import { queryPresets } from '../base';

import type { EventHandlerData } from '../eventHandlers';
import type {
  APIError,
  Filter,
  Grants,
  Params,
  Profile,
  RequestOptions,
  ResourcePage,
  SendPhoneVerificationCodePayload,
  SSHKey,
  TrustedDevice,
  VerifyVerificationCodePayload,
} from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const profileQueries = createQueryKeys('profile', {
  appTokens: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAppTokens(params, filter),
    queryKey: [params, filter],
  }),
  grants: {
    queryFn: listGrants,
    queryKey: null,
  },
  personalAccessTokens: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getPersonalAccessTokens(params, filter),
    queryKey: [params, filter],
  }),
  preferences: {
    queryFn: getUserPreferences,
    queryKey: null,
  },
  profile: (options: RequestOptions = {}) => ({
    queryFn: () => getProfile(options),
    queryKey: [options],
  }),
  securityQuestions: {
    queryFn: getSecurityQuestions,
    queryKey: null,
  },
  sshKeys: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getSSHKeys(params, filter),
    queryKey: [params, filter],
  }),
  trustedDevices: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getTrustedDevices(params, filter),
    queryKey: [params, filter],
  }),
});

export const useProfile = (options: RequestOptions = {}) => {
  return useQuery<Profile, APIError[]>({
    ...profileQueries.profile(options),
    ...queryPresets.oneTimeFetch,
  });
};

export const useMutateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Profile, APIError[], Partial<Profile>>({
    mutationFn: updateProfile,
    onSuccess(newData, variables) {
      updateProfileData(newData, queryClient);

      queryClient.invalidateQueries({
        queryKey: accountQueries.users.queryKey,
      });

      if (variables.email) {
        // If the user updates their email, re-request notifications to
        // potentially clear the email bounce notification.
        queryClient.invalidateQueries({
          queryKey: accountQueries.notifications.queryKey,
        });
      }
    },
  });
};

export const updateProfileData = (
  newData: Partial<Profile>,
  queryClient: QueryClient,
): void => {
  queryClient.setQueryData<Profile>(
    profileQueries.profile().queryKey,
    (oldData: Profile) => ({
      ...oldData,
      ...newData,
    }),
  );
};

export const useGrants = () => {
  const { data: profile } = useProfile();
  return useQuery<Grants, APIError[]>({
    ...profileQueries.grants,
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const useSMSOptOutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: smsOptOut,
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null }, queryClient);
    },
  });
};

export const useSendPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], SendPhoneVerificationCodePayload>({
    mutationFn: sendCodeToPhoneNumber,
  });

export const useVerifyPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], VerifyVerificationCodePayload>({
    mutationFn: verifyPhoneNumberCode,
  });

export const useSSHKeysQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true,
) =>
  useQuery<ResourcePage<SSHKey>, APIError[]>({
    ...profileQueries.sshKeys(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>({
    mutationFn: createSSHKey,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.sshKeys._def,
      });
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });
    },
  });
};

export const useUpdateSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string }>({
    mutationFn: (data) => updateSSHKey(id, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.sshKeys._def,
      });
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });
    },
  });
};

export const useDeleteSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSHKey(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.sshKeys._def,
      });
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });
    },
  });
};

export const sshKeyEventHandler = ({ invalidateQueries }: EventHandlerData) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  invalidateQueries({
    queryKey: profileQueries.sshKeys._def,
  });
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  invalidateQueries({
    queryKey: accountQueries.users._ctx.paginated._def,
  });
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<TrustedDevice>, APIError[]>({
    ...profileQueries.trustedDevices(params, filter),
    placeholderData: keepPreviousData,
  });

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteTrustedDevice(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.trustedDevices._def,
      });
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: disableTwoFactor,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: profileQueries.profile().queryKey,
      });
      // also invalidate the /account/users data because that endpoint returns 2FA status for each user
      queryClient.invalidateQueries({
        queryKey: accountQueries.users._ctx.paginated._def,
      });
    },
  });
};
