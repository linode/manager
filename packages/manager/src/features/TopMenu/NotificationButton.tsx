import * as React from 'react';
import Bell from 'src/assets/icons/bell.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import { NotificationDrawer } from 'src/features/NotificationCenter';

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
    justifyContent: 'space-around'
  },
  text: {
    color: '#3683dc',
    fontSize: 16,
    lineHeight: 1.25
  }
}));

export const NotificationButton: React.FC<{}> = _ => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const classes = useStyles();

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const numEvents = 42;

  return (
    <>
      <button onClick={openDrawer} className={classes.root}>
        <Bell />
        <strong className={classes.text}>{numEvents}</strong>
      </button>
      <NotificationDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
};

export default NotificationButton;
