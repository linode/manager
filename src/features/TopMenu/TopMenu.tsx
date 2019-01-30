import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import IconButton from 'src/components/core/IconButton';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Toolbar from 'src/components/core/Toolbar';
import AddNewMenu from './AddNewMenu';
import SearchBar from './SearchBar';
import UserEventsMenu from './UserEventsMenu';
import UserMenu from './UserMenu';
import UserNotificationsMenu from './UserNotificationsMenu';

type ClassNames = 'root' | 'flex' | 'appBar' | 'toolbar' | 'navIconHide';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    color: theme.palette.text.primary
  },
  flex: {
    flex: 1
  },
  appBar: {
    color: theme.palette.text.primary,
    backgroundColor: theme.bg.white,
    position: 'relative',
    paddingRight: '0 !important'
  },
  toolbar: {
    minHeight: 64,
    paddingLeft: 0,
    paddingRight: 0,
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
      paddingLeft: theme.spacing.unit * 3,
      paddingRight: theme.spacing.unit * 3
    }
  },
  navIconHide: {
    '& > span': {
      justifyContent: 'flex-start'
    },
    '& svg': {
      width: 32,
      height: 32
    },
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  }
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
          <UserNotificationsMenu />
          <UserEventsMenu />
        </Toolbar>
      </AppBar>
    );
  }
}

const styled = withStyles(styles);

export default styled(TopMenu);
