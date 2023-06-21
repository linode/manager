import {
  getProfile,
  listGrants,
  Profile,
  smsOptOut,
  sendCodeToPhoneNumber,
  SendPhoneVerificationCodePayload,
  updateProfile,
  verifyPhoneNumberCode,
  VerifyVerificationCodePayload,
  getSSHKeys,
  createSSHKey,
  SSHKey,
  deleteSSHKey,
  updateSSHKey,
  getTrustedDevices,
  TrustedDevice,
  deleteTrustedDevice,
} from '@linode/api-v4/lib/profile';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { Grants } from '../../../api-v4/lib';
import { queryPresets } from './base';
import { queryKey as accountQueryKey } from './account';
import { AppEventHandler } from 'src/hooks/useAppEventHandlers';

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
      keepPreviousData: true,
      enabled,
    }
  );

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>(
    createSSHKey,
    {
      onSuccess: () => invalidateSSHKeyQueries(queryClient),
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

const invalidateSSHKeyQueries = (queryClient: QueryClient) => {
  // This event handler is a bit aggressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  queryClient.invalidateQueries([queryKey, 'ssh-keys']);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  queryClient.invalidateQueries([accountQueryKey, 'users']);
};

export const sshKeyEventHandler: AppEventHandler = (_, queryClient) =>
  invalidateSSHKeyQueries(queryClient);

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
