import { getQuotaUsage, quotaTypes } from '@linode/api-v4';
import { Button, Divider, Paper, Select, Stack, Typography } from '@linode/ui';
import { useQueries } from '@tanstack/react-query';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
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
  const [selectedLocation, setSelectedLocation] = React.useState<
    SelectOption<'global' | Region['id']>
  >({
    label: 'Global (Account level)',
    value: 'global',
  });
  const [queryEnabled, setQueryEnabled] = React.useState(false);

  const serviceOptions = Object.entries(quotaTypes).map(([key, value]) => ({
    label: value,
    value: key as QuotaType,
  }));

  // Fetch locations for the selected service to populate the location selects
  // This can be a region or a label + id for S3 endpoints
  const {
    isFetching: isFetchingRegions,
    locationsForQuotaService,
    objectStorageQuotas,
    service,
  } = useGetLocationsForQuotaService(selectedService.value);

  // Disable the select and view quotas button if there is no region for the selected service
  // ("Global" is a default entry hence the <= 1 check)
  const noQuotaRegions = locationsForQuotaService.length <= 1;

  // fetch quotas for the selected service and region
  const { data: quotas } = useQuotasQuery(
    selectedService.value,
    {},
    {
      region_applied:
        selectedService.value !== 'object-storage'
          ? selectedLocation.value
          : undefined,
      s3_endpoint:
        selectedService.value === 'object-storage'
          ? selectedLocation.value
          : undefined,
    },
    queryEnabled
  );

  const onSelectServiceChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: SelectOption<QuotaType>
  ) => {
    setQueryEnabled(false);
    setSelectedService(value);
    setSelectedLocation({
      label: 'Global (Account level)',
      value: 'global',
    });
  };

  // The CTA will enable running all quota queries
  const onClickViewQuotas = () => {
    setQueryEnabled(true);
  };

  // Fetch the usage for each quota
  const quotaIds = quotas?.data.map((quota) => quota.quota_id) ?? [];
  const quotaUsageQueries = useQueries({
    queries: quotaIds.map((quotaId) => ({
      enabled: queryEnabled && Boolean(quotas),
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
  const objectStorageQuotasWithUsage = objectStorageQuotas?.map(
    (quota, index) => ({
      ...quota,
      usage: quotaUsageQueries?.[index]?.data,
    })
  );

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
              value={selectedService}
            />
            <Stack alignItems="flex-end" direction="row">
              {service === 'object-storage' ? (
                <Select
                  onChange={(_event, value) => {
                    setSelectedLocation({
                      label: value?.label,
                      value: value?.value,
                    });
                    setQueryEnabled(false);
                  }}
                  value={{
                    label:
                      locationsForQuotaService.find(
                        (loc) => loc.value === selectedLocation.value
                      )?.label ?? '',
                    value: selectedLocation.value,
                  }}
                  label="Object Storage Endpoint"
                  options={locationsForQuotaService}
                  placeholder="Select an Object Storage S3 endpoint"
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
                    setQueryEnabled(false);
                  }}
                  placeholder={
                    isFetchingRegions
                      ? `Loading ${selectedService.label} regions...`
                      : `Select a region for ${selectedService.label}`
                  }
                  currentCapability={undefined}
                  disableClearable
                  disabled={isFetchingRegions || noQuotaRegions}
                  loading={isFetchingRegions}
                  noOptionsText={`No resource found for ${selectedService.label}`}
                  regions={locationsForQuotaService}
                  sx={{ flexGrow: 1, mr: 2 }}
                  value={noQuotaRegions ? undefined : selectedLocation.value}
                />
              )}
              <Button
                buttonType="primary"
                disabled={isFetchingRegions || noQuotaRegions}
                onClick={onClickViewQuotas}
              >
                View Quotas
              </Button>
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h3">Quotas</Typography>
            <Stack alignItems="center" direction="row" spacing={3}>
              {/* TODO LIMITS_M1: update once link is available */}
              <DocsLink href="#" label="Learn More About Quotas" />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            {selectedLocation &&
              (quotas || objectStorageQuotas) &&
              queryEnabled && (
                <pre
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    padding: '1rem',
                    width: '100%',
                  }}
                >
                  {JSON.stringify(
                    quotasWithUsage || objectStorageQuotasWithUsage,
                    null,
                    2
                  )}
                </pre>
              )}
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
