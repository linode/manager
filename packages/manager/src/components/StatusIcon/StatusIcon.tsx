import classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';

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
}));

export type Status = 'active' | 'inactive' | 'error' | 'other';

export interface StatusProps {
  status: Status;
}

export const StatusIcon: React.FC<StatusProps> = (props) => {
  const { status } = props;

  const classes = useStyles();

  return (
    <div
      className={classNames({
        [classes.statusIcon]: true,
        [classes.statusIconRunning]: status === 'active',
        [classes.statusIconOffline]: status === 'inactive',
        [classes.statusIconError]: status === 'error',
        [classes.statusIconOther]: !['inactive', 'active', 'error'].includes(
          status
        ),
        statusOther: !['inactive', 'active', 'error'].includes(status),
      })}
    />
  );
};

export default React.memo(StatusIcon);
