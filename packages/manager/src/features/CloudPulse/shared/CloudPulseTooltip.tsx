import { styled, tooltipClasses, useTheme } from '@mui/material';
import React from 'react';

import { Tooltip } from 'src/components/Tooltip';

import type { TooltipProps } from '@mui/material';

export const CloudPulseTooltip = React.memo((props: TooltipProps) => {
  const theme = useTheme();

  return (
    <BootstrapTooltip
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
      disableHoverListener={props.open !== undefined ? !props.open : false} // Disable hover during operation
      open={props.open}
      placement={props.placement ?? 'top-start'}
      title={props.title}
    >
      <span>{props.children}</span>
    </BootstrapTooltip>
  );
});

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
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
