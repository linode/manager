import { Chip, Tooltip } from '@linode/ui';
import React from 'react';

interface Props {
  tooltipText: React.ReactNode;
}

export const DefaultFirewallChip = (props: Props) => {
  return (
    <Tooltip
      slotProps={{ tooltip: { sx: { minWidth: 245 } } }}
      title={props.tooltipText}
    >
      <Chip label="Default" />
    </Tooltip>
  );
};
