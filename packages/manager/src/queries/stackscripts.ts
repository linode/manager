import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { APIError, Params } from '@linode/api-v4/lib/types';
import { useQueryClient } from 'react-query';

import { getOneClickApps } from 'src/features/StackScripts/stackScriptUtils';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

export const queryKey = 'stackscripts';

export const useStackScriptsOCA = (params: Params = {}) => {
  const queryClient = useQueryClient();

  const prefetchStackScriptsOCA = async () => {
    await queryClient.prefetchQuery<StackScript[], APIError[]>(
      `${queryKey}-oca-all`,
      () => getAllOCAsRequest(params),
      {
        ...queryPresets.oneTimeFetch,
      }
    );
  };

  return {
    prefetchStackScriptsOCA,
  };
};

export const getAllOCAsRequest = (passedParams: Params = {}) =>
  getAll<StackScript>((params) =>
    getOneClickApps({ ...params, ...passedParams })
  )().then((data) => data.data);
