import { getRegions, Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';
import data from 'src/cachedData/regions.json';
import { getAll } from 'src/utilities/getAll';

const cachedData = data.data as Region[];

export const useRegionsQuery = () =>
  useQuery<Region[], APIError[]>('regions', getAllRegionsRequest, {
    ...queryPresets.longLived,
    placeholderData: cachedData,
  });

const getAllRegionsRequest = () =>
  getAll<Region>((params) => getRegions(params))().then((data) => data.data);
