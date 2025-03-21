import { Chip, Tooltip } from '@linode/ui';
import React from 'react';

interface Props {
  tooltipText: string;
}

export const DefaultFirewallChip = (props: Props) => {
  return (
    <Tooltip title={props.tooltipText}>
      <Chip label="Default" />
    </Tooltip>
  );
};
