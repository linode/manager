import * as React from 'react';
import Bell from 'src/assets/icons/bell.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import { notificationContext } from 'src/features/NotificationCenter/NotificationContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    order: 3,
    width: 74,
    height: 34,
    padding: theme.spacing(2),
    backgroundColor: theme.bg.lightBlue, // '#e5f1ff',
    border: 'none',
    borderRadius: 3,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    cursor: 'pointer'
  },
  text: {
    color: '#3683dc',
    fontSize: 16,
    lineHeight: 1.25
  }
}));

const notificationEventTypes = [
  'community_like',
  'community_question_reply',
  'community_mention'
];
// @todo add more here, or filter our events request directly once we
// have a list of all relevant actions.

export const NotificationButton: React.FC<{}> = _ => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const classes = useStyles();

  const context = React.useContext(notificationContext);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const numEvents = context.events.filter(thisEvent =>
    notificationEventTypes.includes(thisEvent.action)
  ).length;

  return (
    <>
      <button
        onClick={openDrawer}
        className={classes.root}
        aria-label="Click to view notifications drawer"
      >
        <Bell aria-hidden />
        <strong className={classes.text}>{numEvents}</strong>
      </button>
      <NotificationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        events={context.events}
      />
    </>
  );
};

export default NotificationButton;
