import { Tooltip } from '@linode/ui';
import React from 'react';

import type { TooltipProps } from '@mui/material';

export const CloudPulseTooltip = React.memo((props: TooltipProps) => {
  const { children, placement, title } = props;

  return (
    <Tooltip
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -7], // Adjust offset if needed
            },
          },
        ],
      }}
      data-qa-tooltip={title}
      data-testid={title}
      placement={placement ?? 'top-start'}
      title={title}
    >
      <span>{children}</span>
    </Tooltip>
  );
});
