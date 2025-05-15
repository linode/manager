import { useRegionsQuery } from '@linode/queries';
import {
  Box,
  CloseIcon,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@linode/ui';
import React from 'react';

import { Flag } from 'src/components/Flag';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

import type { ImageRegionStatus, ImageStatus } from '@linode/api-v4';
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

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <Box alignItems="center" display="flex" justifyContent="space-between">
      <Stack alignItems="center" direction="row" gap={1}>
        <Flag country={actualRegion?.country ?? 'us'} />
        {actualRegion?.label ?? region}
      </Stack>
      <Stack alignItems="center" direction="row" gap={1}>
        <Typography textTransform="capitalize">{status}</Typography>
        <StatusIcon status={imageStatusIconMap[status]} />
        <Tooltip
          title={
            disableRemoveButton
              ? 'You cannot remove this region because at least one available region must be present.'
              : ''
          }
        >
          <span>
            <IconButton
              aria-label={`Remove ${region}`}
              disabled={disableRemoveButton}
              onClick={onRemove}
              sx={{ p: 0.5 }}
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export const imageStatusIconMap: Readonly<
  Record<ExtendedImageRegionStatus | ImageStatus, Status>
> = {
  available: 'active',
  creating: 'other',
  pending: 'other',
  'pending deletion': 'other',
  'pending replication': 'other',
  pending_upload: 'other',
  replicating: 'other',
  timedout: 'error',
  unsaved: 'inactive',
};
