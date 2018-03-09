import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

import UserMenu from 'src/components/UserMenu';
import AddNewMenu from 'src/components/AddNewMenu';
import SearchBar from 'src/components/SearchBar';

const styles = (theme: Theme): StyleRules => ({
  root: {
    color: theme.palette.text.primary,
  },
  flex: {
    flex: 1,
  },
  appBar: {
    color: theme.palette.text.primary,
    backgroundColor: 'white',
    position: 'relative',
  },
  toolbar: {
    minHeight: 64,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

interface Props {
  toggleSideMenu: () => void;
}

type PropsWithStyles = Props & WithStyles<'appBar' | 'navIconHide' | 'flex' | 'leftIcon' 
| 'toolbar'>;

class TopMenu extends React.Component<PropsWithStyles> {
  render() {
    const { classes, toggleSideMenu } = this.props;

    return (
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={toggleSideMenu}
            className={classes.navIconHide}
          >
            <MenuIcon />
          </IconButton>
          <AddNewMenu />
          <SearchBar />
          <UserMenu />
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(TopMenu);
