import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useQuotaServices } from 'src/features/Account/Quotas/hooks/useQuotaServices';
import { QuotaServicePanel } from 'src/features/Account/Quotas/QuotaServicePanel';
import { QuotasPanel } from 'src/features/Account/Quotas/QuotasPanel/QuotasPanel';
import { useIsQuotasIamEnabled } from 'src/features/IAM/hooks/useIsQuotasIamEnabled';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { QuotaServiceType } from '@linode/api-v4';
import type {
  QuotaScope,
  QuotaService,
} from 'src/features/Account/Quotas/quotaServices';

export const Quotas = () => {
  const {
    data: availableServices,
    isFetching: isFetchingServices,
    restrictedServices = [],
  } = useQuotaServices();
  const { isQuotasIamEnabled } = useIsQuotasIamEnabled();
  const navigate = useNavigate({ from: '/quotas' });
  const search = useSearch({ from: '/quotas' });

  const servicesByType = React.useMemo(() => {
    if (!availableServices) {
      return null;
    }
    return new Map<QuotaServiceType, QuotaService>(
      availableServices?.map((service) => [service.type, service])
    );
  }, [availableServices]);

  const selectedServiceType = (search.service ??
    null) as null | QuotaServiceType;

  const selectedService = React.useMemo(() => {
    return selectedServiceType && servicesByType
      ? (servicesByType.get(selectedServiceType) ?? null)
      : null;
  }, [selectedServiceType, servicesByType]);

  const updateSearchService = React.useCallback(
    (service: null | QuotaService) => {
      navigate({
        search: (prev) => ({
          ...prev,
          service: service ? service.type : undefined,
        }),
        replace: true,
      });
    },
    [navigate]
  );

  // reset service query param if the provided service is not available to the user
  React.useEffect(() => {
    if (!isFetchingServices && selectedServiceType && !selectedService) {
      updateSearchService(null);
    }
  }, [
    isFetchingServices,
    selectedServiceType,
    selectedService,
    updateSearchService,
  ]);

  const availableScopes = React.useMemo(() => {
    return selectedService
      ? (Object.keys(selectedService.scopes) as QuotaScope[])
      : [];
  }, [selectedService]);

  const usagePermission = selectedService?.quotaUsagePermission;
  const { data: usagePermissions } = usePermissions(
    'account',
    usagePermission ? [usagePermission] : [],
    undefined,
    isQuotasIamEnabled && Boolean(usagePermission)
  );
  const isMissingUsagePermission = Boolean(
    selectedService &&
      isQuotasIamEnabled &&
      usagePermission &&
      availableScopes.length > 0 &&
      !usagePermissions[usagePermission]
  );

  return (
    <>
      <DocumentTitleSegment segment="Quotas" />
      {isQuotasIamEnabled &&
        !isFetchingServices &&
        restrictedServices.length > 0 && (
          <NotificationBanner type="warning">
            <>
              <p>
                You don&apos;t have permissions to view quotas for the following
                services. Please contact your account administrator to request
                access.
              </p>
              <ul
                style={{
                  margin: `${Spacing.S2} 0 0`,
                  paddingLeft: Spacing.S20,
                }}
              >
                {restrictedServices.map((service) => (
                  <li key={service.type}>{service.label}</li>
                ))}
              </ul>
            </>
          </NotificationBanner>
        )}

      {isMissingUsagePermission && (
        <NotificationBanner
          text={`You don't have permissions to view usage for ${selectedService?.label} quotas. Please contact your account administrator to request access.`}
          type="warning"
        />
      )}

      <QuotaServicePanel
        availableServices={availableServices}
        isFetchingServices={isFetchingServices}
        onServiceChange={updateSearchService}
        selectedService={selectedService}
      />

      {selectedService &&
        availableScopes.map((scope) => (
          <QuotasPanel key={scope} scope={scope} service={selectedService} />
        ))}
    </>
  );
};
