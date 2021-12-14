import {
  getProfile,
  listGrants,
  Profile,
  updateProfile,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery, UseQueryResult } from 'react-query';
import { Grants } from '../../../api-v4/lib';
import { queryClient, queryPresets } from './base';

export const queryKey = 'profile';

export const useProfile = (
  givenProfile?: UseQueryResult<Profile, APIError[]>
) =>
  givenProfile ??
  useQuery<Profile, APIError[]>(
    queryKey,
    getProfile,
    queryPresets.oneTimeFetch
  );

export const useMutateProfile = () => {
  return useMutation<Profile, APIError[], Partial<Profile>>(
    (data) => {
      return updateProfile(data);
    },
    { onSuccess: updateProfileData }
  );
};

export const updateProfileData = (newData: Partial<Profile>): void => {
  queryClient.setQueryData(queryKey, (oldData: Profile) => ({
    ...oldData,
    ...newData,
  }));
};

export const useGrants = () =>
  useQuery<Grants, APIError[]>(
    `${queryKey}-grants`,
    listGrants,
    queryPresets.oneTimeFetch
  );

export const getProfileData = () => queryClient.getQueryData<Profile>(queryKey);
export const getGrantData = () =>
  queryClient.getQueryData<Grants>(`${queryKey}-grants`);
