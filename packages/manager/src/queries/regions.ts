import { Region, getRegions } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

import data from 'src/cachedData/regions.json';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

const cachedData = data.data as Region[];

export const useRegionsQuery = () =>
  useQuery<Region[], APIError[]>('regions', getAllRegionsRequest, {
    ...queryPresets.longLived,
    placeholderData: cachedData,
  });

const getAllRegionsRequest = () =>
  getAll<Region>((params) => getRegions(params))().then((data) => data.data);
