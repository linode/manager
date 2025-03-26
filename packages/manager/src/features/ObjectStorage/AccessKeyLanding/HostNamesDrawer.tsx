import { Box } from '@linode/ui';
import * as React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Drawer } from 'src/components/Drawer';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';

import { CopyAllHostnames } from './CopyAllHostnames';

import type { ObjectStorageKeyRegions } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  regions: ObjectStorageKeyRegions[];
}

export const HostNamesDrawer = (props: Props) => {
  const { onClose, open, regions } = props;
  const { availableStorageRegions, regionsByIdMap } = useObjectStorageRegions();

  if (!availableStorageRegions || !regionsByIdMap) {
    return null;
  }

  return (
    <Drawer onClose={onClose} open={open} title="Regions / S3 Hostnames">
      <Box sx={(theme) => ({ marginTop: theme.spacing(3) })}>
        <CopyAllHostnames
          text={
            regions
              .map((region) => {
                const label = regionsByIdMap[region.id]?.label;
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
              sx={{
                backgroundColor: 'unset',
                border: 'none',
                maxWidth: '100%',
              }}
              value={`${
                regionsByIdMap[region.id]?.label
              }${endpointTypeLabel}: ${region.s3_endpoint}`}
              hideLabel
              key={index}
              label={`${region.id}${endpointTypeLabel}: ${region.s3_endpoint}`}
            />
          );
        })}
      </Box>
    </Drawer>
  );
};
