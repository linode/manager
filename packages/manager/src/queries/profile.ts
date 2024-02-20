import {
  Profile,
  SSHKey,
  SendPhoneVerificationCodePayload,
  TrustedDevice,
  VerifyVerificationCodePayload,
  createSSHKey,
  deleteSSHKey,
  deleteTrustedDevice,
  disableTwoFactor,
  getAppTokens,
  getPersonalAccessTokens,
  getProfile,
  getSSHKeys,
  getTrustedDevices,
  listGrants,
  sendCodeToPhoneNumber,
  smsOptOut,
  updateProfile,
  updateSSHKey,
  verifyPhoneNumberCode,
} from '@linode/api-v4/lib/profile';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { getQueryKeys } from 'src/utilities/queryKeys';

import { Grants } from '../../../api-v4/lib';
import { queryKey as accountQueryKey } from './account';
import { queryPresets } from './base';

import type { RequestOptions } from '@linode/api-v4';

export const { profile: profileQueries } = getQueryKeys({
  profile: {
    appTokens: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getAppTokens(params, filter),
      queryKey: [params, filter],
    }),
    grants: {
      queryFn: listGrants,
    },
    personalAccessTokens: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getPersonalAccessTokens(params, filter),
      queryKey: [params, filter],
    }),
    profile: (options: RequestOptions = {}) => ({
      queryFn: () => getProfile(options),
    }),
    sshKeys: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getSSHKeys(params, filter),
      queryKey: [params, filter],
    }),
    trustedDevices: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getTrustedDevices(params, filter),
      queryKey: [params, filter],
    }),
  },
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
    mutationFn: (data) => updateProfile(data),
    onSuccess: (newData) => updateProfileData(newData, queryClient),
  });
};

export const updateProfileData = (
  newData: Partial<Profile>,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData(
    profileQueries.profile().queryKey,
    (oldData: Profile) => ({
      ...oldData,
      ...newData,
    })
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
  return useMutation<{}, APIError[]>(smsOptOut, {
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null }, queryClient);
    },
  });
};

export const useSendPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], SendPhoneVerificationCodePayload>(
    sendCodeToPhoneNumber
  );

export const useVerifyPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], VerifyVerificationCodePayload>(
    verifyPhoneNumberCode
  );

export const useSSHKeysQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true
) =>
  useQuery({
    ...profileQueries.sshKeys(params, filter),
    enabled,
    keepPreviousData: true,
  });

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>(
    createSSHKey,
    {
      onSuccess() {
        queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountQueryKey, 'users']);
      },
    }
  );
};

export const useUpdateSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string }>(
    (data) => updateSSHKey(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountQueryKey, 'users']);
      },
    }
  );
};

export const useDeleteSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteSSHKey(id), {
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};

export const sshKeyEventHandler = (event: EventHandlerData) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  event.queryClient.invalidateQueries(profileQueries.sshKeys.queryKey);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  event.queryClient.invalidateQueries([accountQueryKey, 'users']);
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<TrustedDevice>, APIError[]>({
    ...profileQueries.trustedDevices(params, filter),
    keepPreviousData: true,
  });

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteTrustedDevice(id), {
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.trustedDevices.queryKey);
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(disableTwoFactor, {
    onSuccess() {
      // invalidate the profile because the /v4/profile endpoint returns 2FA info
      queryClient.invalidateQueries(profileQueries.profile().queryKey);
      // also invalidate the /account/users data because that endpoint returns 2FA status for each user
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};
