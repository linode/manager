import { Box, Drawer } from '@linode/ui';
import * as React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';

import { CopyAllHostnames } from './CopyAllHostnames';

import type { ObjectStorageKey } from '@linode/api-v4';

interface Props {
  isOpen: boolean;
  objectStorageKey?: ObjectStorageKey;
  onClose: () => void;
}

export const HostNamesDrawer = (props: Props) => {
  const { onClose, isOpen, objectStorageKey } = props;

  const { availableStorageRegions, regionsByIdMap } = useObjectStorageRegions();

  const regions = objectStorageKey?.regions || [];

  if (!availableStorageRegions || !regionsByIdMap) {
    return null;
  }

  return (
    <Drawer onClose={onClose} open={isOpen} title="Regions / S3 Hostnames">
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
              hideLabel
              key={index}
              label={`${region.id}${endpointTypeLabel}: ${region.s3_endpoint}`}
              sx={{
                backgroundColor: 'unset',
                border: 'none',
                maxWidth: '100%',
              }}
              value={`${
                regionsByIdMap[region.id]?.label
              }${endpointTypeLabel}: ${region.s3_endpoint}`}
            />
          );
        })}
      </Box>
    </Drawer>
  );
};
