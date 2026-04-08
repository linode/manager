import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useQuotaServices } from 'src/features/Account/Quotas/hooks/useQuotaServices';
import { QuotaServicePanel } from 'src/features/Account/Quotas/QuotaServicePanel';
import { QuotasPanel } from 'src/features/Account/Quotas/QuotasPanel/QuotasPanel';

import type { QuotaServiceType } from '@linode/api-v4';
import type {
  QuotaScope,
  QuotaService,
} from 'src/features/Account/Quotas/quotaServices';

export const Quotas = () => {
  const { data: availableServices, isFetching: isFetchingServices } =
    useQuotaServices();
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

  return (
    <>
      <DocumentTitleSegment segment="Quotas" />
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
