import { styled } from '@mui/material';
import * as React from 'react';

import { omittedProps } from 'src/utilities/omittedProps';

import { Box, BoxProps } from '../Box';

export type Status = 'active' | 'error' | 'inactive' | 'other';

export interface StatusProps extends BoxProps {
  pulse?: boolean;
  status: Status;
}

const StatusIcon = React.memo((props: StatusProps) => {
  const { pulse, status, ...rest } = props;

  const shouldPulse =
    pulse === undefined
      ? // If pulse is not defined, use old behavior for choosing when to pulse
        !['active', 'error', 'inactive'].includes(status)
      : pulse;

  return <StyledDiv pulse={shouldPulse} status={status} {...rest} />;
});

export { StatusIcon };

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
