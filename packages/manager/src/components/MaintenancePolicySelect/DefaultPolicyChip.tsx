import { Chip, Tooltip } from '@linode/ui';
import React from 'react';

import type { ChipProps } from '@linode/ui';

interface Props {
  chipProps?: Partial<ChipProps>;
  tooltipText?: React.ReactNode;
}

export const DefaultPolicyChip = (props: Props) => {
  const { chipProps, tooltipText } = props;
  return (
    <Tooltip
      slotProps={{ tooltip: { sx: { minWidth: 245 } } }}
      title={tooltipText}
    >
      <Chip label="DEFAULT" size="small" {...chipProps} />
    </Tooltip>
  );
};
