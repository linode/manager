import { useAccountSettings, useProfile } from '@linode/queries';
import { useMemo } from 'react';

import {
  objectStorageQuotaService,
  volumesQuotaService,
} from 'src/features/Account/Quotas/quotaServices';
import { useIsQuotasIamEnabled } from 'src/features/IAM/hooks/useIsQuotasIamEnabled';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import type { QuotaService } from 'src/features/Account/Quotas/quotaServices';
import type { AllowedPermissionsFor } from 'src/features/IAM/hooks/usePermissions';

export interface UseQuotaServicesResult {
  data: null | QuotaService[];
  isFetching: boolean;
  /** Services hidden from `data` due to missing IAM permissions. */
  restrictedServices: QuotaService[];
}

export const useQuotaServices = (): UseQuotaServicesResult => {
  const { blockStorageQuotas } = useFlags();
  const { isQuotasIamEnabled } = useIsQuotasIamEnabled();
  const { data: profile, isFetching: isFetchingProfile } = useProfile();
  const { data: accountSettings, isFetching: isFetchingAccountSettings } =
    useAccountSettings();

  // Services available before any IAM permission filtering is applied.
  const quotaServices = useMemo(() => {
    const quotaServices: QuotaService[] = [];

    if (
      profile &&
      !profile.restricted &&
      accountSettings?.object_storage === 'active'
    ) {
      quotaServices.push(objectStorageQuotaService());
    }

    if (blockStorageQuotas) {
      quotaServices.push(volumesQuotaService);
    }

    return quotaServices;
  }, [blockStorageQuotas, profile, accountSettings]);

  const permissionsToCheck = quotaServices
    .map((service) => service.quotaPermission)
    .filter((permission): permission is AllowedPermissionsFor<'account'> =>
      Boolean(permission)
    );

  // Only enforce permission checks once Quotas IAM RBAC is active;
  // otherwise preserve the existing flag-only behavior.
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions(
    'account',
    permissionsToCheck,
    undefined,
    isQuotasIamEnabled
  );

  const { result, restrictedServices } = useMemo(() => {
    const restrictedServices: QuotaService[] = [];

    const result = quotaServices.filter((service) => {
      if (!isQuotasIamEnabled || !service.quotaPermission) {
        return true;
      }
      const hasPermission = permissions[service.quotaPermission];
      if (!hasPermission) {
        restrictedServices.push(service);
      }
      return hasPermission;
    });

    return { result, restrictedServices };
  }, [quotaServices, isQuotasIamEnabled, permissions]);

  return {
    data: result,
    isFetching: Boolean(
      isFetchingProfile ||
        isFetchingAccountSettings ||
        (isQuotasIamEnabled && isLoadingPermissions)
    ),
    restrictedServices,
  };
};
