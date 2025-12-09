import { IconButton, Tooltip } from '@linode/ui';
import BoltIcon from '@mui/icons-material/Bolt';
import React from 'react';

import type { LinodeCapabilities } from '@linode/api-v4';

interface Props {
  linodeCapabilities: LinodeCapabilities[];
}

export function HighPerformanceVolumeIcon({ linodeCapabilities }: Props) {
  const isHighPerformanceVolume = !!linodeCapabilities?.includes(
    'Block Storage Performance B1'
  );

  if (!isHighPerformanceVolume) {
    return null;
  }

  return (
    <Tooltip title="High Performance">
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
