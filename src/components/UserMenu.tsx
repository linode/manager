import * as React from 'react';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { compose } from 'redux';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';

type MenuLink = {
  display: string,
  href: string,
};

const menuLinks: MenuLink[] = [
  { display: 'Edit Profile', href: '/profile' },
  { display: 'Log Out', href: '/logout' },
];

const styles = (theme: Theme): StyleRules => ({
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
});

type Props = WithStyles<'leftIcon'> & RouteComponentProps<{}>;

interface State {
  anchorEl?: HTMLElement;
}

class UserMenu extends React.Component<Props, State> {
  state = {
    anchorEl: undefined,
  };

  handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  navigate(href: string) {
    const { history } = this.props;
    history.push(href);
    this.handleClose();
  }

  renderMenuLink(menuLink: MenuLink) {
    return (
      <MenuItem key={menuLink.display} onClick={() => this.navigate(menuLink.href)}>
        {menuLink.display}
      </MenuItem>
    );
  }

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <Button
          onClick={this.handleMenu}
          color="inherit"
        >
          <AccountCircle className={classes.leftIcon}/>
          jsmith
        </Button>
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={this.handleClose}
        >
          {menuLinks.map(menuLink => this.renderMenuLink(menuLink))}
        </Menu>
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(UserMenu) as Linode.TodoAny;
