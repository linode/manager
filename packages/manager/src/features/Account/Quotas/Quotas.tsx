import { getQuotaUsage, quotaTypes } from '@linode/api-v4';
import {
  CircleProgress,
  Divider,
  Paper,
  Select,
  Stack,
  Typography,
} from '@linode/ui';
import { useQueries } from '@tanstack/react-query';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { regionFactory } from 'src/factories';
import { useQuotasQuery } from 'src/queries/quotas/quotas';

import { useGetLocationsForQuotaService } from './utils';

import type { QuotaType, Region } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Theme } from '@mui/material';

export const Quotas = () => {
  const [selectedService, setSelectedService] = React.useState<
    SelectOption<QuotaType>
  >({
    label: 'Linodes',
    value: 'linode',
  });
  const [selectedLocation, setSelectedLocation] = React.useState<SelectOption<
    'global' | Region['id']
  > | null>(null);
  const locationData = useGetLocationsForQuotaService(selectedService.value);

  const {
    data: quotas,
    isFetching: isFetchingQuotas,
    refetch,
  } = useQuotasQuery(
    selectedService.value,
    {},
    {
      region_applied:
        selectedService.value !== 'object-storage'
          ? selectedLocation?.value
          : undefined,
      s3_endpoint:
        selectedService.value === 'object-storage'
          ? selectedLocation?.value
          : undefined,
    },
    Boolean(selectedLocation?.value)
  );

  // Build Service options
  const serviceOptions = Object.entries(quotaTypes).map(([key, value]) => ({
    label: value,
    value: key as QuotaType,
  }));

  // Build Location options

  const { regions, s3Endpoints } = locationData;
  const globalOption = regionFactory.build({
    capabilities: [],
    id: 'global',
    label: 'Global (Account level)',
  });
  const memoizedLocationOptions = React.useMemo(() => {
    return [globalOption, ...(regions ?? [])];
  }, [regions, globalOption]);

  // Fetch the usage for each quota
  const quotaIds = quotas?.data.map((quota) => quota.quota_id) ?? [];
  const quotaUsageQueries = useQueries({
    queries: quotaIds.map((quotaId) => ({
      enabled: selectedService && Boolean(selectedLocation) && Boolean(quotas),
      queryFn: () => getQuotaUsage(selectedService.value, quotaId),
      queryKey: ['quota-usage', selectedService.value, quotaId],
    })),
  });

  // Combine the quotas with their usage
  // This may be different once we build the table to display the data
  const quotasWithUsage = quotas?.data.map((quota, index) => ({
    ...quota,
    usage: quotaUsageQueries?.[index]?.data,
  }));

  // Loading logic
  // - Locations
  const isFetchingLocations =
    'isFetchingObjectStorageQuotas' in locationData
      ? locationData.isFetchingObjectStorageQuotas
      : locationData.isFetchingRegions;
  // - Quotas
  const isLoadingQuotaUsage = quotaUsageQueries.some(
    (query) => query.isLoading
  );
  const isLoadingQuotasTable =
    isFetchingQuotas || isLoadingQuotaUsage || !quotasWithUsage;

  // Handlers
  const onSelectServiceChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: SelectOption<QuotaType>
  ) => {
    setSelectedService(value);
    setSelectedLocation(null);
    refetch();
  };

  return (
    <>
      <DocumentTitleSegment segment="Quotas" />
      <Paper
        sx={(theme: Theme) => ({
          marginTop: theme.spacing(2),
        })}
        variant="outlined"
      >
        <Stack divider={<Divider spacingBottom={20} spacingTop={40} />}>
          <Stack spacing={1}>
            <Select
              label="Select a Service"
              onChange={onSelectServiceChange}
              options={serviceOptions}
              placeholder="Select a service"
              value={selectedService}
            />

            {selectedService.value === 'object-storage' ? (
              <Select
                onChange={(_event, value) => {
                  setSelectedLocation({
                    label: value?.label,
                    value: value?.value,
                  });
                }}
                options={
                  memoizedLocationOptions.map((location) => ({
                    label: location.label,
                    value: location.label,
                  })) ?? []
                }
                placeholder={
                  isFetchingLocations
                    ? `Loading ${selectedService.label} S3 endpoints...`
                    : 'Select an Object Storage S3 endpoint'
                }
                value={{
                  label:
                    s3Endpoints?.find(
                      (loc) => loc.label === selectedLocation?.value
                    )?.label ?? '',
                  value: selectedLocation?.value ?? '',
                }}
                label="Object Storage Endpoint"
                loading={isFetchingLocations}
                searchable
                sx={{ flexGrow: 1, mr: 2 }}
              />
            ) : (
              <RegionSelect
                onChange={(_event, value) => {
                  setSelectedLocation({
                    label: value.label,
                    value: value.id,
                  });
                }}
                placeholder={
                  isFetchingLocations
                    ? `Loading ${selectedService.label} regions...`
                    : `Select a region for ${selectedService.label}`
                }
                currentCapability={undefined}
                disableClearable
                disabled={isFetchingLocations}
                loading={isFetchingLocations}
                noOptionsText={`No resource found for ${selectedService.label}`}
                regions={memoizedLocationOptions}
                sx={{ flexGrow: 1, mr: 2 }}
                value={selectedLocation?.value}
              />
            )}
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h3">Quotas</Typography>
            <Stack alignItems="center" direction="row" spacing={3}>
              {/* TODO LIMITS_M1: update once link is available */}
              <DocsLink href="#" label="Learn More About Quotas" />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            {selectedLocation ? (
              isLoadingQuotasTable ? (
                <CircleProgress />
              ) : (
                <pre
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    padding: '1rem',
                    width: '100%',
                  }}
                >
                  {JSON.stringify(quotasWithUsage, null, 2)}
                </pre>
              )
            ) : (
              <Typography>
                Select a service and region to view quotas
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
