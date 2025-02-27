import { getQuotaUsage, quotaTypes } from '@linode/api-v4';
import { Divider, Paper, Select, Stack, Typography } from '@linode/ui';
import { useQueries } from '@tanstack/react-query';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useQuotasQuery } from 'src/queries/quotas/quotas';

import { QuotasTable } from './QuotasTable';
import { getQuotasFilters, useGetLocationsForQuotaService } from './utils';

import type { Quota, QuotaType } from '@linode/api-v4';
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
    Quota['region_applied']
  > | null>(null);
  const locationData = useGetLocationsForQuotaService(selectedService.value);
  const filters = getQuotasFilters({
    location: selectedLocation,
    service: selectedService,
  });

  const { data: quotas, isFetching: isFetchingQuotas } = useQuotasQuery(
    selectedService.value,
    {},
    filters,
    Boolean(selectedLocation?.value)
  );

  // Build Service options
  const serviceOptions = Object.entries(quotaTypes).map(([key, value]) => ({
    label: value,
    value: key as QuotaType,
  }));

  // Destructure Locations for both the regions and s3 endpoints controls
  const { regions, s3Endpoints } = locationData;

  // Fetch the usage for each quota, depending on the service
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
    'isFetchingS3Endpoints' in locationData
      ? locationData.isFetchingS3Endpoints
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
        <Stack>
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
                  s3Endpoints?.map((location) => ({
                    label: location.label,
                    value: location.value,
                  })) ?? []
                }
                placeholder={
                  isFetchingLocations
                    ? `Loading ${selectedService.label} S3 endpoints...`
                    : 'Select an Object Storage S3 endpoint'
                }
                disabled={isFetchingLocations}
                label="Object Storage Endpoint"
                loading={isFetchingLocations}
                searchable
                sx={{ flexGrow: 1, mr: 2 }}
              />
            ) : (
              <RegionSelect
                onChange={(_event, region) => {
                  setSelectedLocation({
                    label: region.label,
                    value: region.id,
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
                regions={regions ?? []}
                sx={{ flexGrow: 1, mr: 2 }}
                value={selectedLocation?.value}
              />
            )}
          </Stack>
          <Divider spacingBottom={40} spacingTop={40} />
          <Stack
            direction="row"
            justifyContent="space-between"
            marginBottom={2}
          >
            <Typography variant="h3">Quotas</Typography>
            <Stack
              sx={(theme) => ({
                position: 'relative',
                top: `-${theme.spacing(2)}`,
              })}
              alignItems="center"
              direction="row"
              spacing={3}
            >
              {/* TODO LIMITS_M1: update once link is available */}
              <DocsLink href="#" label="Learn More About Quotas" />
            </Stack>
          </Stack>
          <Typography>
            This table shows quotas and usage. If you need to increase a quota,
            select Request an Increase from the Actions menu.
          </Typography>
          <Stack direction="column" spacing={2}>
            <QuotasTable
              hasSelectedLocation={Boolean(selectedLocation)}
              isLoading={isLoadingQuotasTable}
              quotasWithUsage={quotasWithUsage ?? []}
            />
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
