import { quotaTypes } from '@linode/api-v4';
import { Divider, Paper, Select, Stack, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useQuotasQuery } from 'src/queries/quotas/quotas';

import { useGetLocationsForQuotaService } from './utils';

import type { QuotaType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Theme } from '@mui/material';

export const Quotas = () => {
  // @ts-expect-error TODO: this is a placeholder to be replaced with the actual query
  const [lastUpdatedDate, setLastUpdatedDate] = React.useState(Date.now());
  const [selectedService, setSelectedService] = React.useState<
    SelectOption<QuotaType>
  >({
    label: 'Linodes',
    value: 'linode',
  });
  const [selectedLocation, setSelectedLocation] = React.useState<null | string>(
    null
  );

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
  const { data: quotas } = useQuotasQuery(
    selectedService.value,
    {},
    {
      region_applied: selectedLocation,
    },
    selectedLocation !== null && selectedService.value !== 'object-storage'
  );

  const onServiceChange = (
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
        <Stack divider={<Divider spacingBottom={20} spacingTop={40} />}>
          <Stack spacing={1}>
            <Select
              label="Select a Service"
              onChange={onServiceChange}
              options={serviceOptions}
              value={selectedService}
            />
            {service === 'object-storage' ? (
              <Select
                onChange={(_event, value) =>
                  setSelectedLocation(value?.value.toString() ?? null)
                }
                value={
                  selectedLocation
                    ? {
                        label:
                          locationsForQuotaService.find(
                            (loc) => loc.value === selectedLocation
                          )?.label ?? selectedLocation,
                        value: selectedLocation,
                      }
                    : null
                }
                label="Object Storage Endpoint"
                options={locationsForQuotaService}
                placeholder="Select an Object Storage S3 endpoint"
              />
            ) : (
              <RegionSelect
                onChange={(_event, value) =>
                  setSelectedLocation(value?.id ?? null)
                }
                placeholder={
                  isFetchingRegions
                    ? `Loading ${selectedService.label} regions...`
                    : `Select a region for ${selectedService.label}`
                }
                currentCapability={undefined}
                disableClearable
                disabled={isFetchingRegions}
                loading={isFetchingRegions}
                noOptionsText={`No resource found for ${selectedService.label}`}
                regions={locationsForQuotaService}
                value={selectedLocation ?? ''}
              />
            )}
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h3">Quotas</Typography>
            <Stack alignItems="center" direction="row" spacing={3}>
              <Typography variant="body1">
                <strong>Last updated:</strong>{' '}
                <DateTimeDisplay
                  value={DateTime.fromMillis(lastUpdatedDate).toISO() ?? ''}
                />
              </Typography>

              {/* TODO LIMITS_M1: update once link is available */}
              <DocsLink href="#" label="Learn More About Quotas" />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            {selectedLocation && (quotas || objectStorageQuotas) && (
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
