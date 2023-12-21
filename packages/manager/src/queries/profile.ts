import { getQueryKeys } from '@bnussman/query-key';
import { Grants } from '@linode/api-v4';
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
  RequestOptions,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { EventWithStore } from 'src/events';

import { queryKey as accountQueryKey } from './account';
import { queryPresets } from './base';

export const profileQueries = getQueryKeys({
  profile: ({ headers }: RequestOptions = {}) => ({
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
    profile: {
      queryFn: () => getProfile({ headers }),
      queryKey: [headers],
    },
    sshKeys: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getSSHKeys(params, filter),
      queryKey: [params, filter],
    }),
    trustedDevices: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getTrustedDevices(params, filter),
      queryKey: [params, filter],
    }),
  }),
});

export const useProfile = () =>
  useQuery<Profile, APIError[]>({
    ...profileQueries.profile(),
    ...queryPresets.oneTimeFetch,
  });

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
    ...profileQueries.profile().grants,
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const getProfileData = (queryClient: QueryClient) =>
  queryClient.getQueryData<Profile>(profileQueries.profile().queryKey);

export const getGrantData = (queryClient: QueryClient) =>
  queryClient.getQueryData<Grants>(profileQueries.profile().queryKey);

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
  enabled = true
) =>
  useQuery({
    ...profileQueries.profile().sshKeys(params, filter),
    enabled,
    keepPreviousData: true,
  });

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>({
    mutationFn: createSSHKey,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.profile().sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};

export const useUpdateSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string }>({
    mutationFn: (data) => updateSSHKey(id, data),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.profile().sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};

export const useDeleteSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSHKey(id),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.profile().sshKeys.queryKey);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};

export const sshKeyEventHandler = (event: EventWithStore) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  event.queryClient.invalidateQueries(
    profileQueries.profile().sshKeys.queryKey
  );
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  event.queryClient.invalidateQueries([accountQueryKey, 'users']);
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<TrustedDevice>, APIError[]>({
    ...profileQueries.profile().trustedDevices(params, filter),
    keepPreviousData: true,
  });

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteTrustedDevice(id),
    onSuccess() {
      queryClient.invalidateQueries(
        profileQueries.profile().trustedDevices.queryKey
      );
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: disableTwoFactor,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.profile().queryKey);
      // also invalidate the /account/users data because that endpoint returns 2FA data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};
