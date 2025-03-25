import { Chip, Tooltip } from '@linode/ui';
import React from 'react';

import type { SxProps } from '@mui/material';

interface Props {
  chipProps?: Partial<ChipProps>;
  tooltipText: React.ReactNode;
}

export const DefaultFirewallChip = (props: Props) => {
  return (
    <Tooltip
      slotProps={{ tooltip: { sx: { minWidth: 245 } } }}
      title={props.tooltipText}
    >
      <Chip label="DEFAULT" size="small" {...props.chipProps} />
    </Tooltip>
  );
};
