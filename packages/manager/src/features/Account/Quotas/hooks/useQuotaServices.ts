import { useAccountSettings, useProfile } from '@linode/queries';
import { useMemo } from 'react';

import {
  objectStorageQuotaService,
  volumesQuotaService,
} from 'src/features/Account/Quotas/quotaServices';
import { useFlags } from 'src/hooks/useFlags';

import type { QuotaService } from 'src/features/Account/Quotas/quotaServices';

export interface UseQuotaServicesResult {
  data: null | QuotaService[];
  isFetching: boolean;
}

export const useQuotaServices = (): UseQuotaServicesResult => {
  const { blockStorageQuotas, objectStorageGlobalQuotas } = useFlags();
  const { data: profile, isFetching: isFetchingProfile } = useProfile();
  const { data: accountSettings, isFetching: isFetchingAccountSettings } =
    useAccountSettings();

  const result = useMemo(() => {
    const result: QuotaService[] = [];
    if (
      profile &&
      !profile.restricted &&
      accountSettings?.object_storage === 'active'
    ) {
      result.push(objectStorageQuotaService(objectStorageGlobalQuotas));
    }
    if (blockStorageQuotas) {
      result.push(volumesQuotaService);
    }

    return result;
  }, [objectStorageGlobalQuotas, blockStorageQuotas, profile, accountSettings]);

  return {
    data: result,
    isFetching: isFetchingProfile || isFetchingAccountSettings,
  };
};
