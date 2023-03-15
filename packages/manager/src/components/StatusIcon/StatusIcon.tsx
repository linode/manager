import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  statusIcon: {
    display: 'inline-block',
    borderRadius: '50%',
    height: '16px',
    width: '16px',
    marginRight: theme.spacing(),
    position: 'relative',
  },
  statusIconRunning: {
    backgroundColor: theme.color.teal,
  },
  statusIconOffline: {
    backgroundColor: theme.color.grey8,
  },
  statusIconError: {
    backgroundColor: theme.color.red,
  },
  statusIconOther: {
    backgroundColor: theme.color.orange,
  },
  pulse: {
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}));

export type Status = 'active' | 'inactive' | 'error' | 'other';

export interface StatusProps {
  status: Status;
  pulse?: boolean;
}

export const StatusIcon = (props: StatusProps) => {
  const { status, pulse } = props;

  const classes = useStyles();

  const shouldPulse =
    pulse === undefined
      ? // If pulse is not defined, use old behavior for choosing when to pulse
        !['inactive', 'active', 'error'].includes(status)
      : pulse;

  return (
    <div
      className={classNames({
        [classes.statusIcon]: true,
        [classes.pulse]: shouldPulse,
        [classes.statusIconRunning]: status === 'active',
        [classes.statusIconOffline]: status === 'inactive',
        [classes.statusIconError]: status === 'error',
        [classes.statusIconOther]: !['inactive', 'active', 'error'].includes(
          status
        ),
      })}
    />
  );
};

export default React.memo(StatusIcon);
