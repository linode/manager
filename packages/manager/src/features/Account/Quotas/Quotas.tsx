import { quotaTypes } from '@linode/api-v4';
import { Divider, Paper, Select, Stack, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useQuotasQuery } from 'src/queries/quotas/quotas';

import { useGetRegionsForQuotaService } from './utils';

import type { QuotaType, Region } from '@linode/api-v4';
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
  const serviceOptions = Object.entries(quotaTypes).map(([key, value]) => ({
    label: value,
    value: key as QuotaType,
  }));
  const [selectedRegion, setSelectedRegion] = React.useState<
    Region['id'] | null
  >(null);
  const {
    isFetching: isFetchingRegions,
    regionsForQuotaService,
  } = useGetRegionsForQuotaService(selectedService.value);
  const { data: quotas } = useQuotasQuery(
    selectedService.value,
    {},
    {},
    selectedRegion !== null
  );

  const onServiceChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: SelectOption<QuotaType>
  ) => {
    setSelectedService(value);
    setSelectedRegion(null);
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
            <RegionSelect
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
              onChange={(_event, value) => setSelectedRegion(value?.id ?? null)}
              regions={regionsForQuotaService}
              showGlobalOption
              value={selectedRegion ?? ''}
            />
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
            {selectedRegion && quotas && (
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  overflow: 'auto',
                  padding: '1rem',
                  width: '100%',
                }}
              >
                {JSON.stringify(quotas, null, 2)}
              </pre>
            )}
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
