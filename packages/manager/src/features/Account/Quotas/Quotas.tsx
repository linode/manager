import { quotaTypes } from '@linode/api-v4';
import { Divider, Paper, Select, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';

import { QuotasTable } from './QuotasTable';
import { useGetLocationsForQuotaService } from './utils';

import type { Quota, QuotaType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Theme } from '@mui/material';
import { useIsGeckoEnabled } from '@linode/shared';

export const Quotas = () => {
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const history = useHistory();
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

  const serviceOptions = Object.entries(quotaTypes).map(([key, value]) => ({
    label: value,
    value: key as QuotaType,
  }));

  const { regions, s3Endpoints } = locationData;
  const isFetchingLocations =
    'isFetchingS3Endpoints' in locationData
      ? locationData.isFetchingS3Endpoints
      : locationData.isFetchingRegions;

  // Handlers
  const onSelectServiceChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: SelectOption<QuotaType>
  ) => {
    setSelectedService(value);
    setSelectedLocation(null);
    // remove search params
    history.push('/account/quotas');
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
                  history.push('/account/quotas');
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
                  history.push('/account/quotas');
                }}
                placeholder={
                  isFetchingLocations
                    ? `Loading ${selectedService.label} regions...`
                    : `Select a region for ${selectedService.label}`
                }
                currentCapability={undefined}
                disableClearable
                disabled={isFetchingLocations}
                isGeckoLAEnabled={isGeckoLAEnabled}
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
            select <strong>Request an Increase</strong> from the Actions menu.
          </Typography>
          <Stack direction="column" spacing={2}>
            <QuotasTable
              selectedLocation={selectedLocation}
              selectedService={selectedService}
            />
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
