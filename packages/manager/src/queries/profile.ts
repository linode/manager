import {
  getProfile,
  listGrants,
  Profile,
  updateProfile,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { Grants } from '../../../api-v4/lib';
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

export const useGrants = () =>
  useQuery<Grants, APIError[]>(
    `${queryKey}-grants`,
    listGrants,
    queryPresets.oneTimeFetch
  );
