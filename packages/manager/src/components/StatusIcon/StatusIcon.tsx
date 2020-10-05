import * as classNames from 'classnames';
import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  statusCell: {
    whiteSpace: 'nowrap',
    width: '17%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  statusCellMaintenance: {
    [theme.breakpoints.up('md')]: {
      width: '20%'
    },
    '& .data': {
      display: 'flex',
      alignItems: 'center',
      lineHeight: 1.2,
      marginRight: -12,
      [theme.breakpoints.down('sm')]: {
        minWidth: 200,
        justifyContent: 'flex-end'
      },
      [theme.breakpoints.up('md')]: {
        minWidth: 200
      }
    },
    '& button': {
      padding: '0 6px',
      position: 'relative',
      top: 1,
      [theme.breakpoints.up('md')]: {
        padding: 6
      }
    }
  },
  statusIcon: {
    display: 'inline-block',
    borderRadius: '50%',
    height: '16px',
    width: '16px',
    marginRight: theme.spacing(),
    position: 'relative',
    top: 2
  },
  statusIconRunning: {
    backgroundColor: theme.palette.cmrIconColors.iGreen
  },
  statusIconOther: {
    backgroundColor: theme.palette.cmrIconColors.iOrange
  },
  statusIconOffline: {
    backgroundColor: theme.palette.cmrIconColors.iGrey
  },
  statusIconError: {
    backgroundColor: theme.color.red
  },
  statusHelpIcon: {
    position: 'relative',
    top: -2
  }
}));

export type Status = 'active' | 'inactive' | 'error' | 'other';

export interface StatusProps {
  status: Status;
}

export const StatusIcon: React.FC<StatusProps> = props => {
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
        statusOther: !['inactive', 'active', 'error'].includes(status)
      })}
    />
  );
};

export default React.memo(StatusIcon);
