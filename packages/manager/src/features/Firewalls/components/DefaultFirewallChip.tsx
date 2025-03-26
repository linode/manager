import { Chip, Tooltip } from '@linode/ui';
import React from 'react';

import type { ChipProps } from '@linode/ui';

interface Props {
  chipProps?: Partial<ChipProps>;
  numEntitiesIsDefaultFor: number;
  tooltipText: React.ReactNode;
}

export const DefaultFirewallChip = (props: Props) => {
  const { chipProps, numEntitiesIsDefaultFor, tooltipText } = props;
  return (
    <Tooltip
      slotProps={{ tooltip: { sx: { minWidth: 245 } } }}
      title={tooltipText}
    >
      <Chip
        label={`DEFAULT${
          numEntitiesIsDefaultFor > 1 ? ` (${numEntitiesIsDefaultFor})` : ''
        }`}
        size="small"
        {...chipProps}
      />
    </Tooltip>
  );
};
