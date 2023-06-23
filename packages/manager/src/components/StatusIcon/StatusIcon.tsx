import * as React from 'react';
import { styled } from '@mui/material/styles';

export type Status = 'active' | 'inactive' | 'error' | 'other';

export interface StatusProps {
  status: Status;
  pulse?: boolean;
}

const StatusIcon = React.memo((props: StatusProps) => {
  const { pulse, status } = props;

  const shouldPulse =
    pulse === undefined
      ? // If pulse is not defined, use old behavior for choosing when to pulse
        !['inactive', 'active', 'error'].includes(status)
      : pulse;

  return <StyledDiv pulse={shouldPulse} status={status} />;
});

export { StatusIcon };

const StyledDiv = styled('div')<StatusProps>(({ theme, ...props }) => ({
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
  ...(!['inactive', 'active', 'error'].includes(props.status) && {
    backgroundColor: theme.color.orange,
  }),
  ...(props.pulse && {
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
}));
