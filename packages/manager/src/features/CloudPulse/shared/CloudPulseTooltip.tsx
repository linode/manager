import { styled, tooltipClasses } from '@mui/material';
import React from 'react';

import { Tooltip } from 'src/components/Tooltip';

import type { TooltipProps } from '@mui/material';

export const CloudPulseTooltip = React.memo((props: TooltipProps) => {
  const { children, placement, title } = props;

  return (
    <StyledTooltip
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
      arrow
      data-qa-tooltip={title}
      data-test-id={title}
      placement={placement ?? 'top-start'}
      title={title}
    >
      <span>{children}</span>
    </StyledTooltip>
  );
});

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: theme.spacing(1.75),
    maxHeight: theme.spacing(3.5),
    maxWidth: theme.spacing(30),
    padding: theme.spacing(0.75),
  },
}));
