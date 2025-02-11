import { quotaTypes } from '@linode/api-v4';
import { Button, Divider, Paper, Select, Stack, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
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

  // fetch quotas for the selected service and region
  const { data: quotas, dataUpdatedAt } = useQuotasQuery(
    selectedService.value,
    {},
    {
      region_applied:
        selectedService.value !== 'object-storage'
          ? selectedLocation
          : undefined,
      s3_endpoint:
        selectedService.value === 'object-storage'
          ? selectedLocation
          : undefined,
    },
    queryEnabled
  );

  const onServiceChange = (
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

  const onClickViewQuotas = () => {
    setQueryEnabled(true);
  };

  const noQuotaRegions = locationsForQuotaService.length <= 1;

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
              onChange={onServiceChange}
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
                  disabled={
                    isFetchingRegions || locationsForQuotaService.length <= 2
                  }
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
              <Typography variant="body1">
                <strong>Last updated:</strong>{' '}
                <DateTimeDisplay
                  value={DateTime.fromMillis(dataUpdatedAt).toISO() ?? ''}
                />
              </Typography>

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
                  {JSON.stringify(quotas || objectStorageQuotas, null, 2)}
                </pre>
              )}
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
