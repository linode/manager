import * as React from 'react';
import Clock from 'src/assets/icons/clock.svg';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Link from 'src/components/Link';
import useAccount from 'src/hooks/useAccount';
import usePreferences from 'src/hooks/usePreferences';
import Community from './Community';
import Maintenance from './Maintenance';
import { NotificationData } from './NotificationData/useNotificationData';
import { ContentRow, NotificationItem } from './NotificationSection';
import OpenSupportTickets from './OpenSupportTickets';
import PastDue from './PastDue';
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
    updatePreferences({
      notification_drawer_view: chronologicalView ? 'grouped' : 'list'
    });
    setChronologicalView(currentView => !currentView);
  };

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
        <Tooltip title="Toggle chronological display" placement="left">
          <IconButton
            aria-label="Toggle chronological display"
            aria-describedby={'viewToggle'}
            onClick={handleToggleView}
            disableRipple
          >
            <Clock />
          </IconButton>
        </Tooltip>
      </div>

      {chronologicalView ? (
        <ChronologicalView
          notifications={chronologicalNotificationList}
          onClose={onClose}
        />
      ) : (
        <div className={classes.notificationSectionContainer}>
          {chronologicalNotificationList.length === 0 ? (
            // If this list is empty there's nothing to show regardless of selected view.
            <EmptyMessage onClose={onClose} />
          ) : null}
          <PendingActions pendingActions={pendingActions} onClose={onClose} />
          <Maintenance statusNotifications={statusNotifications} />
          <OpenSupportTickets
            loading={support.loading}
            error={Boolean(support.error)}
            openTickets={support.data}
            onClose={onClose}
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

const EmptyMessage: React.FC<{ onClose: () => void }> = React.memo(props => {
  return (
    <Typography>
      No notifications to display.{' '}
      <Link to="/events" onClick={props.onClose}>
        View event history.
      </Link>
    </Typography>
  );
});

interface ChronoProps {
  notifications: NotificationItem[];
  onClose: () => void;
}
const ChronologicalView: React.FC<ChronoProps> = props => {
  const { notifications, onClose } = props;
  if (notifications.length === 0) {
    return <EmptyMessage onClose={onClose} />;
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
