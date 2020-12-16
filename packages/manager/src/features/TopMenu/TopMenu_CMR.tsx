import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Toolbar from 'src/components/core/Toolbar';
import Typography from 'src/components/core/Typography';
import AddNewMenu from './AddNewMenu/AddNewMenu_CMR';
import Community from './Community';
import Help from './Help';
import NotificationButton from './NotificationButton';
import SearchBar from './SearchBar/SearchBar_CMR';
import UserMenu from './UserMenu/UserMenu_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    height: 50,
    color: theme.palette.text.primary,
    backgroundColor: theme.cmrBGColors.bgSecondaryActions,
    position: 'relative',
    paddingRight: '0 !important',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  toolbar: {
    padding: 0,
    height: `50px !important`,
    width: '100%'
  },
  communityIcon: {
    [theme.breakpoints.down(370)]: {
      ...theme.visually.hidden
    }
  }
}));

interface Props {
  openSideMenu: () => void;
  desktopMenuToggle: () => void;
  isLoggedInAsCustomer: boolean;
  username: string;
}

type PropsWithStyles = Props;

const TopMenu: React.FC<PropsWithStyles> = props => {
  const {
    openSideMenu,
    username,
    isLoggedInAsCustomer,
    desktopMenuToggle
  } = props;

  const classes = useStyles();

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
          <Hidden smDown>
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={desktopMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Hidden mdUp>
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={openSideMenu}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <AddNewMenu />
          <SearchBar />
          <Help />
          <Community className={classes.communityIcon} />
          <NotificationButton />
          <UserMenu />
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default React.memo(TopMenu);
