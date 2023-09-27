import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { APIError, Params } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

import { getOneClickApps } from 'src/features/StackScripts/stackScriptUtils';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

export const queryKey = 'stackscripts';

export const useStackScriptsOCA = (enabled: boolean, params: Params = {}) => {
  return useQuery<StackScript[], APIError[]>(
    [`${queryKey}-oca-all`, params],
    () => getAllOCAsRequest(params),
    {
      enabled,
      ...queryPresets.oneTimeFetch,
    }
  );
};

export const getAllOCAsRequest = (passedParams: Params = {}) =>
  getAll<StackScript>((params) =>
    getOneClickApps({ ...params, ...passedParams })
  )().then((data) => data.data);
