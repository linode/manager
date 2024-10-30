import { Box } from '@linode/ui';
import * as React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Drawer } from 'src/components/Drawer';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getRegionsByRegionId } from 'src/utilities/regions';

import { CopyAllHostnames } from './CopyAllHostnames';

import type { ObjectStorageKeyRegions } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  regions: ObjectStorageKeyRegions[];
}

export const HostNamesDrawer = (props: Props) => {
  const { onClose, open, regions } = props;
  const { data: regionsData } = useRegionsQuery();
  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  if (!regionsData || !regionsLookup) {
    return null;
  }

  return (
    <Drawer onClose={onClose} open={open} title="Regions / S3 Hostnames">
      <Box sx={(theme) => ({ marginTop: theme.spacing(3) })}>
        <CopyAllHostnames
          text={
            regions
              .map((region) => {
                const label = regionsLookup[region.id]?.label;
                const endpointType = region.endpoint_type
                  ? ` (${region.endpoint_type})`
                  : '';
                return `${label}${endpointType}: ${region.s3_endpoint}`;
              })
              .join('\n') ?? ''
          }
        />
      </Box>
      <Box
        sx={(theme) => ({
          backgroundColor: theme.bg.main,
          border: `1px solid ${theme.color.grey3}`,
          padding: theme.spacing(1),
        })}
      >
        {regions.map((region, index) => {
          const endpointTypeLabel = region?.endpoint_type
            ? ` (${region.endpoint_type})`
            : '';

          return (
            <CopyableTextField
              value={`${regionsLookup[region.id]?.label}${endpointTypeLabel}: ${
                region.s3_endpoint
              }`}
              hideLabel
              key={index}
              label={`${region.id}${endpointTypeLabel}: ${region.s3_endpoint}`}
              sx={{ border: 'none', maxWidth: '100%' }}
            />
          );
        })}
      </Box>
    </Drawer>
  );
};
