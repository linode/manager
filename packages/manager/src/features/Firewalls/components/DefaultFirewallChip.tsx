import { Chip, Tooltip } from '@linode/ui';
import React from 'react';

import type { ChipProps } from '@linode/ui';

interface Props {
  chipProps?: Partial<ChipProps>;
  defaultNumEntities: number;
  tooltipText: React.ReactNode;
}

export const DefaultFirewallChip = (props: Props) => {
  const { chipProps, defaultNumEntities, tooltipText } = props;
  return (
    <Tooltip
      slotProps={{ tooltip: { sx: { minWidth: 245 } } }}
      title={tooltipText}
    >
      <Chip
        label={`DEFAULT${
          defaultNumEntities > 1 ? ` (${defaultNumEntities})` : ''
        }`}
        size="small"
        {...chipProps}
      />
    </Tooltip>
  );
};
