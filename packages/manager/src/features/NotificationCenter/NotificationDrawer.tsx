import * as React from 'react';
import Clock from 'src/assets/icons/clock.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Alerts from './Alerts';
import Community from './Community';
import Maintenance from './Maintenance';
import OpenSupportTickets from './OpenSupportTickets';
import PastDue from './PastDue';
import PendingActions from './PendingActions';
import useAccount from 'src/hooks/useAccount';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('md')]: {
        width: 620
      },
      padding: theme.spacing(2) + 4,
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
  open: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = props => {
  const { open, onClose } = props;
  const { account } = useAccount();
  const classes = useStyles();
  const balance = (account.data?.balance ?? 0) + 50;
  return (
    <Drawer open={open} onClose={onClose} title="" className={classes.root}>
      {balance > 0 ? <PastDue balance={balance} /> : null}
      <div className={classes.actionHeader}>
        <Clock />
      </div>
      <div className={classes.notificationSectionContainer}>
        <PendingActions />
        <Maintenance />
        <Alerts />
        <OpenSupportTickets />
        <Community communityEvents={[]} />
      </div>
    </Drawer>
  );
};

export default React.memo(NotificationDrawer);
