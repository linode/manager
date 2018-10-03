import { path } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import ButtonBase from '@material-ui/core/ButtonBase';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import UserIcon from 'src/assets/icons/user.svg';
import { getGravatarUrl } from 'src/utilities/gravatar';

interface MenuLink {
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

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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

type CombinedProps = StateProps & WithStyles<CSSClasses> & RouteComponentProps<{}>;

interface State {
  anchorEl?: HTMLElement;
  gravatarUrl: string | undefined;
}

export class UserMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
    gravatarUrl: undefined,
  };

  constructor(props: CombinedProps) {
    super(props);
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

  setGravatarUrl(email: string) {
    getGravatarUrl(email)
      .then((url) => {
        this.setState({ gravatarUrl: url });
      });
  }

  componentWillReceiveProps(nextProps: StateProps) {
    /** 2018-09-06: Should this be in componentDidUpdate? */
    const { userEmail: currentUserEmail } = this.props;
    const { userEmail } = nextProps;

    if (userEmail && userEmail !== currentUserEmail) {
      this.setGravatarUrl(userEmail);
    }
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

    const { userEmail } = this.props;

    if (userEmail) {
      this.setGravatarUrl(userEmail);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { classes, username } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <ButtonBase
          onClick={this.handleMenu}
          className={` ${classes.button} ${anchorEl && 'active'}`}
          data-qa-user-menu
        >
          {username &&
            <React.Fragment>
              {this.renderAvatar()}
              <span className={classes.username}>
                {username && username}
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

interface StateProps {
  userEmail?: string;
  username?: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  userEmail: path(['data', 'email'], state.__resources.profile),
  username: path(['data', 'username'], state.__resources.profile),
});

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connect(mapStateToProps),
  withStyles(styles, { withTheme: true }),
  withRouter,
)(UserMenu);
