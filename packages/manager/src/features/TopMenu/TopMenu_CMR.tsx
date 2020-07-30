import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import { makeStyles, Theme } from 'src/components/core/styles';
import Toolbar from 'src/components/core/Toolbar';
import Typography from 'src/components/core/Typography';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import AddNewMenu from './AddNewMenu/AddNewMenu_CMR';
import SearchBar from './SearchBar/SearchBar_CMR';
import UserEventsMenu from './UserEventsMenu';
import UserNotificationsMenu from './UserNotificationsMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    height: 50,
    color: theme.palette.text.primary,
    backgroundColor: theme.bg.topMenu,
    position: 'relative',
    paddingRight: '0 !important',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  toolbar: {
    padding: 0,
    height: `50px !important`,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    [theme.breakpoints.up('lg')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3)
    },
    width: 1280,
    paddingLeft: '0px !important',
    paddingRight: '0px !important'
  }
}));

interface Props {
  isLoggedInAsCustomer: boolean;
  username: string;
}

type PropsWithStyles = Props;

const TopMenu: React.FC<PropsWithStyles> = props => {
  const { username, isLoggedInAsCustomer } = props;

  const classes = useStyles();

  const [drawerOpen, setDrawerOpen] = React.useState(true);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <React.Fragment>
      {isLoggedInAsCustomer && (
        <div
          style={{
            backgroundColor: 'pink',
            padding: '1em',
            textAlign: 'center'
          }}
        >
          <Typography style={{ fontSize: '1.2em', color: 'black' }}>
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </div>
      )}
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar} variant="dense">
          <AddNewMenu />
          <SearchBar />
          <UserNotificationsMenu />
          <UserEventsMenu />
        </Toolbar>
      </AppBar>
      <NotificationDrawer open={drawerOpen} onClose={closeDrawer} />
    </React.Fragment>
  );
};

export default React.memo(TopMenu);
