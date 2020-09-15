import * as React from 'react';
import Clock from 'src/assets/icons/clock.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Community from './Community';
import Maintenance from './Maintenance';
import OpenSupportTickets from './OpenSupportTickets';
import PastDue from './PastDue';
import PendingActions from './PendingActions';
import useAccount from 'src/hooks/useAccount';
import usePreferences from 'src/hooks/usePreferences';
import IconButton from 'src/components/core/IconButton';
import { NotificationData } from './NotificationData/useNotificationData';
import { ContentRow, NotificationItem } from './NotificationSection';

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
  const { account } = useAccount();
  const classes = useStyles();
  const balance = account.data?.balance ?? 0;
  const { community, pendingActions, statusNotifications, support } = data;

  const { preferences, updatePreferences } = usePreferences();

  const currentView = preferences?.notification_drawer_view ?? 'grouped';

  const [chronologicalView, setChronologicalView] = React.useState(
    currentView === 'list'
  );

  const handleToggleView = () => {
    setChronologicalView(currentView => !currentView);
  };

  React.useEffect(() => {
    const newPreference = chronologicalView ? 'list' : 'grouped';
    if (newPreference !== currentView) {
      updatePreferences({
        notification_drawer_view: newPreference
      });
    }

    // eslint-disable-next-line
  }, [chronologicalView, currentView]);

  const chronologicalNotificationList = React.useMemo(() => {
    return [
      ...community.events,
      ...pendingActions,
      ...statusNotifications,
      ...support.data
    ].sort(chronologicalSort);
  }, [community.events, pendingActions, support.data, statusNotifications]);

  return (
    <Drawer open={open} onClose={onClose} title="" className={classes.root}>
      {balance > 0 ? <PastDue balance={balance} /> : null}
      <div id="viewToggle" className={classes.actionHeader}>
        <IconButton
          aria-label="Toggle chronological display"
          aria-describedby={'viewToggle'}
          title={`Toggle chronological display`}
          onClick={handleToggleView}
          disableRipple
        >
          <Clock />
        </IconButton>
      </div>

      {chronologicalView ? (
        <ChronologicalView notifications={chronologicalNotificationList} />
      ) : (
        <div className={classes.notificationSectionContainer}>
          <PendingActions pendingActions={pendingActions} />
          <Maintenance statusNotifications={statusNotifications} />
          <OpenSupportTickets
            loading={support.loading}
            error={Boolean(support.error)}
            openTickets={support.data}
          />
          <Community
            communityEvents={community.events}
            loading={community.loading}
            error={Boolean(community.error)}
          />
        </div>
      )}
    </Drawer>
  );
};

export default React.memo(NotificationDrawer);

interface ChronoProps {
  notifications: NotificationItem[];
}
const ChronologicalView: React.FC<ChronoProps> = props => {
  const { notifications } = props;
  if (notifications.length === 0) {
    return <Typography>No notifications to display.</Typography>;
  }
  return (
    <>
      {' '}
      {notifications.map(thisItem => (
        <ContentRow key={`chronological-list-${thisItem.id}`} item={thisItem} />
      ))}
    </>
  );
};
