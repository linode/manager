import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import Toolbar from 'material-ui/Toolbar';

import IconButton from 'material-ui/IconButton';

import MenuIcon from 'material-ui-icons/Menu';

import { menuWidth } from 'src/components/SideMenu';
import UserMenu from 'src/components/UserMenu';
import { TodoAny } from 'src/utils';

const styles = (theme: Theme): StyleRules => ({
  flex: {
    flex: 1,
  },
  appBar: {
    backgroundColor: '#333',
    position: 'absolute',
    marginLeft: menuWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${menuWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

interface Props extends WithStyles<'appBar' | 'navIconHide' | 'flex' | 'leftIcon'> {
  toggleSideMenu: () => void;
}

class TopMenu extends React.Component<Props> {
  render() {
    const { classes, toggleSideMenu } = this.props;

    return (
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={toggleSideMenu}
            className={classes.navIconHide}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            Linode Manager
          </Typography>
          <UserMenu />
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(
  TopMenu,
) as TodoAny;
