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

import UserIcon from 'src/assets/icons/user.svg';

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
| 'button'
| 'userWrapper'
| 'leftIcon'
| 'username'
| 'menuItem'
| 'hidden';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  menu: {
    transform: `translateY(${theme.spacing.unit}px)`,
  },
  button: {
    padding: theme.spacing.unit,
    borderRadius: 30,
    '&:hover, &.active': {
      '& $username': {
        color: theme.palette.primary.main,
      },
      '& $userWrapper': {
        boxShadow: '0 0 10px #bbb',
      },
    },
    '&:focus': {
      '& $username': {
        color: theme.palette.primary.main,
      },
    },
  },
  userWrapper: {
    marginRight: theme.spacing.unit,
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    transition: theme.transitions.create(['box-shadow']),
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      width: '40px',
      height: '40px',
    },
  },
  leftIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
  username: {
    transition: theme.transitions.create(['color']),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  menuItem: {
    fontSize: '.9rem',
    fontWeight: 400,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
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

  constructor(props: PropsWithStylesAndRoutes) {
    super(props);
    props.profile && this.getGravatarUrl(props.profile);
  }

  mounted: boolean = false;

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
        onClick={() => this.navigate(menuLink.href)}
        data-qa-menu-link={menuLink.display}
      >
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
        if (!this.mounted) { return; }

        this.setState({ gravatarUrl: response.config.url });
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.setState({ gravatarUrl: 'not found' });
      });
  }

  componentWillReceiveProps(nextProps: Props) {
    nextProps.profile && this.getGravatarUrl(nextProps.profile);
  }

  renderAvatar() {
    const { classes } = this.props;
    const { gravatarUrl } = this.state;
    if (!gravatarUrl) { return null; }
    return (gravatarUrl !== 'not found'
      ? <div className={classes.userWrapper}>
          <img src={gravatarUrl} className={classes.leftIcon} />
        </div>
      : <div className={classes.userWrapper}>
          <UserIcon className={classes.leftIcon} />
        </div>
    );
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { profile, classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <ButtonBase
          onClick={this.handleMenu}
          className={` ${classes.button} ${anchorEl && 'active'}`}
          data-qa-user-menu
        >
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
