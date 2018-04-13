import * as React from 'react';
import Axios from 'axios';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { pathOr } from 'ramda';
import * as md5 from 'md5';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import ButtonBase from 'material-ui/ButtonBase';
import Menu, { MenuItem } from 'material-ui/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';
import LinodeTheme from 'src/theme';

type MenuLink = {
  display: string,
  href: string,
};

const menuLinks: MenuLink[] = [
  { display: 'My Profile', href: '/profile' },
  { display: 'Log Out', href: '/logout' },
];

type CSSClasses =
| 'menu'
| 'leftIcon'
| 'username'
| 'menuItem'
| 'hidden';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  menu: {
    transform: `translateY(${theme.spacing.unit}px)`,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
    width: '50px',
    height: '50px',
    borderRadius: '50px',
    [theme.breakpoints.down('sm')]: {
      width: '40px',
      height: '40px',
    },
  },
  username: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  menuItem: {
    fontSize: '.9rem',
    fontWeight: 400,
    '&:hover, &:focus': {
      backgroundColor: LinodeTheme.bg.offWhite,
      color: theme.palette.primary.main,
    },
  },
  hidden: {
    height: 0,
    padding: 0,
  },
});

const mapStateToProps = (state: Linode.AppState) => ({
  profile: pathOr({}, ['resources', 'profile', 'data'], state),
});

interface Props {
  profile: Linode.Profile;
}

type PropsWithStylesAndRoutes = Props & WithStyles<CSSClasses> & RouteComponentProps<{}>;

interface State {
  anchorEl?: HTMLElement;
  gravatarUrl: string | undefined;
}

export class UserMenu extends React.Component<PropsWithStylesAndRoutes, State> {
  state = {
    anchorEl: undefined,
    gravatarUrl: undefined,
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
    const { classes } = this.props;
    return (
      <MenuItem
        key={menuLink.display}
        className={classes.menuItem}
        onClick={() => this.navigate(menuLink.href)}>
        {menuLink.display}
      </MenuItem>
    );
  }

  getEmailHash(email: string) {
    return email && md5(email.trim().toLowerCase());
  }

  getGravatarUrl(profile: Linode.Profile) {
    if (!profile.email) { return; }
    const url = `https://gravatar.com/avatar/${this.getEmailHash(profile.email)}?d=404`;
    const instance = Axios.create();
    return instance.get(url)
      .then((response) => {
        this.setState({ gravatarUrl: response.config.url });
      })
      .catch((error) => {
        this.setState({ gravatarUrl: 'not found' });
      });
  }

  componentWillReceiveProps(nextProps: Props) {
    nextProps.profile &&
      this.getGravatarUrl(nextProps.profile);
  }

  renderAvatar() {
    const { classes } = this.props;
    const { gravatarUrl } = this.state;
    if (!gravatarUrl) { return null; }
    return (gravatarUrl !== 'not found'
      ? <img src={gravatarUrl} className={classes.leftIcon} />
      : <AccountCircle className={classes.leftIcon} />
    );
  }

  render() {
    const { profile, classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <ButtonBase onClick={this.handleMenu}>
          {profile.username &&
            <React.Fragment>
              {this.renderAvatar()}
              <span className={classes.username}>
                {profile.username && profile.username}
              </span>
            </React.Fragment>
          }
        </ButtonBase>
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
          className={classes.menu}
        >
          <MenuItem key="placeholder" className={classes.hidden} />
          {menuLinks.map(menuLink => this.renderMenuLink(menuLink))}
        </Menu>
      </React.Fragment>
    );
  }
}

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connect<Props>(mapStateToProps),
  withStyles(styles, { withTheme: true }),
  withRouter,
)(UserMenu);
