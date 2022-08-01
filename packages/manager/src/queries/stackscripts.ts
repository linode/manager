import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getOneClickApps } from 'src/features/StackScripts/stackScriptUtils';

export const queryKey = 'stackscripts';

export const useStackScriptsOCA = (enabled: boolean) => {
  return useQuery<ResourcePage<StackScript>, APIError[]>(
    `${queryKey}-oca`,
    getOneClickApps,
    {
      enabled,
    }
  );
};
