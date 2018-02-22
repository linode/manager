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
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';

import MenuIcon from 'material-ui-icons/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';

import { menuWidth } from 'src/components/SideMenu';
// import UserMenu from 'src/components/UserMenu';
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
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
});

interface Props extends WithStyles<'appBar' | 'navIconHide' | 'flex' | 'leftIcon'> {
  toggleSideMenu: () => void;
}

class TopMenu extends React.Component<Props> {
  state = {
    anchorEl: undefined,
  };

  handleMenu = (event: any) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { classes, toggleSideMenu } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

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
          <div>
            <Button
              onClick={this.handleMenu}
              color="inherit"
            >
              <AccountCircle className={classes.leftIcon}/>
              jsmith
            </Button>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              open={open}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.handleClose}>Edit Profile</MenuItem>
              <MenuItem onClick={this.handleClose}>Log Out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(
  TopMenu,
) as TodoAny;
