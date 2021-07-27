import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { getLinodeTypes, LinodeType } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { queryPresets } from './base';

const queryKey = 'types';

export const useTypes = () =>
  useQuery<LinodeType[], APIError[]>(queryKey, getAllTypesRequest, {
    ...queryPresets.longLived,
  });

export const getAllTypesRequest = () =>
  getAll<LinodeType>((params) => getLinodeTypes(params))().then(
    (data) => data.data
  );
