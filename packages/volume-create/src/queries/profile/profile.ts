import {
  getAppTokens,
  getPersonalAccessTokens,
  getProfile,
  getSSHKeys,
  getSecurityQuestions,
  getTrustedDevices,
  getUserPreferences,
  listGrants,
} from "@linode/api-v4";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

import { queryPresets } from "../base";

import type {
  APIError,
  Filter,
  Grants,
  Params,
  Profile,
  RequestOptions,
} from "@linode/api-v4";
import type { QueryClient } from "@tanstack/react-query";

export const profileQueries = createQueryKeys("profile", {
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

const updateProfileData = (
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
