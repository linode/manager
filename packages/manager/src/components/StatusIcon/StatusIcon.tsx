import { styled } from '@mui/material';
import * as React from 'react';

import { omittedProps } from 'src/utilities/omittedProps';

import { Box, BoxProps } from '../Box';

export type Status = 'active' | 'error' | 'inactive' | 'other';

export interface StatusProps extends BoxProps {
  /**
   * Optional property can override the value of the default aria label for status.
   * This is useful when the status is not descriptive enough.
   */
  ariaLabel?: string;
  /**
   * When true, displays the icon with a pulsing animation.
   */
  pulse?: boolean;
  /**
   * Status of the icon.
   */
  status: Status;
}

export const StatusIcon = React.memo((props: StatusProps) => {
  const { ariaLabel, pulse, status, ...rest } = props;

  const shouldPulse =
    pulse === undefined
      ? // If pulse is not defined, use old behavior for choosing when to pulse
        !['active', 'error', 'inactive'].includes(status)
      : pulse;

  return (
    <StyledDiv
      aria-label={ariaLabel ?? `Status is ${status}`}
      pulse={shouldPulse}
      status={status}
      {...rest}
    />
  );
});

const StyledDiv = styled(Box, {
  shouldForwardProp: omittedProps(['pulse', 'status']),
})<StatusProps>(({ theme, ...props }) => ({
  borderRadius: '50%',
  display: 'inline-block',
  height: '16px',
  marginRight: theme.spacing(),
  position: 'relative',
  transition: theme.transitions.create(['color']),
  width: '16px',
  ...(props.status === 'active' && {
    backgroundColor: theme.color.teal,
  }),
  ...(props.status === 'inactive' && {
    backgroundColor: theme.color.grey8,
  }),
  ...(props.status === 'error' && {
    backgroundColor: theme.color.red,
  }),
  ...(!['active', 'error', 'inactive'].includes(props.status) && {
    backgroundColor: theme.color.orange,
  }),
  ...(props.pulse && {
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
}));
