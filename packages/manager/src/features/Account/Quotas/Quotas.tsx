import {
  Box,
  Divider,
  Notice,
  Paper,
  Select,
  Stack,
  Typography,
} from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import { getRestrictedResourceText } from '../../Account/utils';
import { QuotasTable } from './QuotasTable';
import { useGetLocationsForQuotaService } from './utils';

import type { Quota } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Theme } from '@mui/material';

export const Quotas = () => {
  const navigate = useNavigate();
  const flags = useFlags();

  const [selectedLocation, setSelectedLocation] =
    React.useState<null | SelectOption<Quota['region_applied']>>(null);
  const locationData = useGetLocationsForQuotaService('object-storage');
  const { s3Endpoints } = locationData;
  const isFetchingLocations =
    'isFetchingS3Endpoints' in locationData
      ? locationData.isFetchingS3Endpoints
      : locationData.isFetchingRegions;

  const sortedS3Endpoints = React.useMemo(() => {
    return s3Endpoints?.sort((a, b) => a.label.localeCompare(b.label));
  }, [s3Endpoints]);

  return (
    <>
      <DocumentTitleSegment segment="Quotas" />
      {flags?.iamRbacPrimaryNavChanges && flags?.limitsEvolution?.enabled ? (
        <Paper
          sx={(theme: Theme) => ({
            marginTop: theme.spacingFunction(16),
          })}
          variant="outlined"
        >
          <Stack>
            <Typography variant="h2">Object Storage</Typography>
            <Box sx={{ display: 'flex' }}>
              <Notice spacingTop={16} variant="info">
                <Typography>
                  View your Object Storage quotas by applying the endpoint
                  filter below.{' '}
                  <Link to="https://techdocs.akamai.com/cloud-computing/docs/quotas">
                    Learn more about quotas
                  </Link>
                  .
                </Typography>
              </Notice>
            </Box>
            <Stack spacing={1}>
              <Select
                disabled={isFetchingLocations}
                label="Object Storage Endpoint"
                loading={isFetchingLocations}
                onChange={(_event, value) => {
                  setSelectedLocation({
                    label: value?.label,
                    value: value?.value,
                  });
                  navigate({
                    to: flags?.iamRbacPrimaryNavChanges
                      ? '/quotas'
                      : '/account/quotas',
                  });
                }}
                options={
                  sortedS3Endpoints?.map((location) => ({
                    label: location.label,
                    value: location.value,
                  })) ?? []
                }
                placeholder={
                  isFetchingLocations
                    ? `Loading S3 endpoints...`
                    : 'Select an Object Storage S3 endpoint'
                }
                searchable
                sx={{ flexGrow: 1, mr: 2 }}
              />
            </Stack>
            <Divider spacingBottom={40} spacingTop={40} />
            <Stack
              direction="row"
              justifyContent="space-between"
              marginBottom={2}
            >
              <Typography variant="h3">Quotas</Typography>
            </Stack>
            <Typography>
              If you need to increase a quota, select{' '}
              <strong>Request Increase</strong> from the Actions menu. Usage can
              also be found using third-party tools like{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/using-s3cmd-with-object-storage#check-disk-usage-by-bucket">
                s3cmd
              </Link>
              .
            </Typography>
            <Stack direction="column" spacing={2}>
              <QuotasTable
                selectedLocation={selectedLocation}
                selectedService={{
                  label: 'Object Storage',
                  value: 'object-storage',
                }}
              />
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Notice
          text={getRestrictedResourceText({
            action: 'view',
            resourceType: 'Quotas',
          })}
          variant="warning"
        />
      )}
    </>
  );
};
