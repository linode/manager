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

import { EventWithStore } from 'src/events';

import { Grants } from '../../../api-v4/lib';
import { queryKey as accountQueryKey } from './account';
import { queryPresets } from './base';

export const queryKey = 'profile';

export const useProfile = (givenProfile?: Profile) =>
  useQuery<Profile, APIError[]>(queryKey, getProfile, {
    ...queryPresets.oneTimeFetch,
    initialData: givenProfile,
  });

export const useMutateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Profile, APIError[], Partial<Profile>>(
    (data) => updateProfile(data),
    { onSuccess: (newData) => updateProfileData(newData, queryClient) }
  );
};

export const updateProfileData = (
  newData: Partial<Profile>,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData(queryKey, (oldData: Profile) => ({
    ...oldData,
    ...newData,
  }));
};

export const useGrants = () => {
  const { data: profile } = useProfile();
  return useQuery<Grants, APIError[]>([queryKey, 'grants'], listGrants, {
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const getProfileData = (queryClient: QueryClient) =>
  queryClient.getQueryData<Profile>(queryKey);
export const getGrantData = (queryClient: QueryClient) =>
  queryClient.getQueryData<Grants>([queryKey, 'grants']);

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
  useQuery(
    [queryKey, 'ssh-keys', 'paginated', params, filter],
    () => getSSHKeys(params, filter),
    {
      enabled,
      keepPreviousData: true,
    }
  );

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>(
    createSSHKey,
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'ssh-keys']);
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
        queryClient.invalidateQueries([queryKey, 'ssh-keys']);
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
      queryClient.invalidateQueries([queryKey, 'ssh-keys']);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};

export const sshKeyEventHandler = (event: EventWithStore) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  event.queryClient.invalidateQueries([queryKey, 'ssh-keys']);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  event.queryClient.invalidateQueries([accountQueryKey, 'users']);
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<TrustedDevice>, APIError[]>(
    [queryKey, 'trusted-devices', 'paginated', params, filter],
    () => getTrustedDevices(params, filter),
    {
      keepPreviousData: true,
    }
  );

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteTrustedDevice(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'trusted-devices']);
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(disableTwoFactor, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};
