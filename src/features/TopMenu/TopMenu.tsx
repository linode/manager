import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { StyleRules, withStyles, WithStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';

import AddNewMenu from './AddNewMenu';
import SearchBar from './SearchBar';
// import UserEventsMenu from './UserEventsMenu';
import UserMenu from './UserMenu';
// import UserNotificationMenu from './UserNotificationMenu';

type ClassNames = 'appBar'
  | 'navIconHide'
  | 'flex'
  | 'leftIcon'
  | 'toolbar';

const styles = (theme: Linode.Theme): StyleRules => ({
  root: {
    color: theme.palette.text.primary,
  },
  flex: {
    flex: 1,
  },
  appBar: {
    color: theme.palette.text.primary,
    backgroundColor: theme.bg.white,
    position: 'relative',
    paddingRight: '0 !important',
  },
  toolbar: {
    minHeight: 64,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
      paddingLeft: theme.spacing.unit * 3,
      paddingRight: theme.spacing.unit * 3,
    },
  },
  navIconHide: {
    '& > span': {
      justifyContent: 'flex-start',
    },
    '& svg': {
      width: 32,
      height: 32,
    },
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

interface Props {
  openSideMenu: () => void;
}

type PropsWithStyles = Props & WithStyles<ClassNames>;

class TopMenu extends React.Component<PropsWithStyles> {
  render() {
    const { classes, openSideMenu } = this.props;

    return (
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={openSideMenu}
            className={classes.navIconHide}
          >
            <MenuIcon />
          </IconButton>
          <AddNewMenu />
          <SearchBar />
          <UserMenu />
          {/* <UserNotificationsMenu />
          <UserEventsMenu /> */}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(TopMenu);
