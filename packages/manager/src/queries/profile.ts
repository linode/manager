import { getProfile, Profile, updateProfile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryPresets } from './base';

export const queryKey = 'profile';

export const useProfile = () =>
  useQuery<Profile, APIError[]>(
    queryKey,
    getProfile,
    queryPresets.oneTimeFetch
  );

export const useMutateProfile = () => {
  return useMutation<Profile, APIError[], Partial<Profile>>((data) => {
    return updateProfile(data);
  });
};
