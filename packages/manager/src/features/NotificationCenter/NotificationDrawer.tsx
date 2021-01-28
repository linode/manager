import * as React from 'react';
import Clock from 'src/assets/icons/clock.svg';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Link from 'src/components/Link';
import usePreferences from 'src/hooks/usePreferences';
import { NotificationData } from './NotificationData/useNotificationData';
import { ContentRow, NotificationItem } from './NotificationSection';
import PendingActions from './PendingActions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('md')]: {
        width: 620
      },
      overflowX: 'hidden'
    }
  },
  notificationSectionContainer: {
    '& > div': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
    }
  },
  actionHeader: {
    display: 'flex',
    paddingBottom: theme.spacing(),
    justifyContent: 'flex-end',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    marginBottom: theme.spacing(3)
  }
}));

interface Props {
  data: NotificationData;
  open: boolean;
  onClose: () => void;
}

const chronologicalSort = (a: NotificationItem, b: NotificationItem) => {
  const timeA = a.timeStamp ?? Infinity;
  const timeB = b.timeStamp ?? Infinity;
  if (timeA < timeB) {
    return 1;
  }
  if (timeA > timeB) {
    return -1;
  }
  return 0;
};

export const NotificationDrawer: React.FC<Props> = props => {
  const { data, open, onClose } = props;
  const classes = useStyles();
  const { pendingActions } = data;

  return (
    <Drawer open={open} onClose={onClose} title="" className={classes.root}>
      <div className={classes.notificationSectionContainer}>
        <PendingActions pendingActions={pendingActions} onClose={onClose} />
      </div>
    </Drawer>
  );
};

export default React.memo(NotificationDrawer);
