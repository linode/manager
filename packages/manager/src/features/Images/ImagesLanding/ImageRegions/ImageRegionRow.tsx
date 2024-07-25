import Close from '@mui/icons-material/Close';
import React from 'react';

import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { IconButton } from 'src/components/IconButton';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { ImageRegionStatus } from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

type ExtendedImageRegionStatus = 'unsaved' | ImageRegionStatus;

interface Props {
  disableRemoveButton?: boolean;
  onRemove: () => void;
  region: string;
  status: ExtendedImageRegionStatus;
}

export const ImageRegionRow = (props: Props) => {
  const { disableRemoveButton, onRemove, region, status } = props;

  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <Box alignItems="center" display="flex" justifyContent="space-between">
      <Stack alignItems="center" direction="row" gap={1}>
        <Flag country={actualRegion?.country ?? 'us'} />
        {actualRegion?.label ?? region}
      </Stack>
      <Stack alignItems="center" direction="row" gap={1}>
        <Typography textTransform="capitalize">{status}</Typography>
        <StatusIcon
          status={IMAGE_REGION_STATUS_TO_STATUS_ICON_STATUS[status]}
        />
        <IconButton
          aria-label={`Remove ${region}`}
          disabled={disableRemoveButton}
          onClick={onRemove}
          sx={{ p: 0.5 }}
        >
          <Close />
        </IconButton>
      </Stack>
    </Box>
  );
};

const IMAGE_REGION_STATUS_TO_STATUS_ICON_STATUS: Readonly<
  Record<ExtendedImageRegionStatus, Status>
> = {
  available: 'active',
  creating: 'other',
  pending: 'other',
  'pending deletion': 'other',
  'pending replication': 'inactive',
  replicating: 'other',
  timedout: 'inactive',
  unsaved: 'inactive',
};
