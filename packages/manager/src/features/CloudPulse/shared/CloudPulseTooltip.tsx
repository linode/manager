import { Tooltip } from '@linode/ui';
import React from 'react';

import type { TooltipProps } from '@mui/material';

export const CloudPulseTooltip = React.memo((props: TooltipProps) => {
  const { children, placement, title } = props;

  return (
    <Tooltip
      data-qa-tooltip={title}
      data-testid={title}
      placement={placement ?? 'top-start'}
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
      title={title}
    >
      <span>{children}</span>
    </Tooltip>
  );
});
