import * as React from 'react';

import { Box } from 'src/components/Box';
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
              .map((region) =>
                region?.endpoint_type
                  ? `${regionsLookup[region.id]?.label} (${
                      region.endpoint_type
                    }): ${region.s3_endpoint}`
                  : `${regionsLookup[region.id]?.label}: ${region.s3_endpoint}`
              )
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
        {regions.map((region, index) => (
          <CopyableTextField
            label={
              region?.endpoint_type
                ? `${region.id} (${region.endpoint_type}): ${region.s3_endpoint}`
                : `${region.id}: ${region.s3_endpoint}`
            }
            value={
              region?.endpoint_type
                ? `${regionsLookup[region.id]?.label} (${
                    region.endpoint_type
                  }): ${region.s3_endpoint}`
                : `${regionsLookup[region.id]?.label}: ${region.s3_endpoint}`
            }
            hideLabel
            key={index}
            sx={{ border: 'none', maxWidth: '100%' }}
          />
        ))}
      </Box>
    </Drawer>
  );
};
