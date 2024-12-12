import BoltIcon from '@mui/icons-material/Bolt';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

import type { LinodeCapabilities } from '@linode/api-v4';

interface Props {
  linodeCapabilities?: LinodeCapabilities[];
}

export function HighPerformanceVolumeIcon({ linodeCapabilities }: Props) {
  const isHighPerformanceVolume = !!linodeCapabilities?.includes(
    'Block Storage Performance B1'
  );

  if (!isHighPerformanceVolume) {
    return null;
  }

  return (
    <Tooltip arrow title="High Performance">
      <IconButton
        sx={{
          border: '1px solid',
          borderRadius: '50%',
          padding: 0,
        }}
      >
        <BoltIcon sx={{ fontSize: 12 }} />
      </IconButton>
    </Tooltip>
  );
}
