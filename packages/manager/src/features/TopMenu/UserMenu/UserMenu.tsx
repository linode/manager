import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import UserIcon from 'src/assets/icons/user.svg';
import ButtonBase from 'src/components/core/ButtonBase';
import Hidden from 'src/components/core/Hidden';
import Menu from 'src/components/core/Menu';
import MenuItem from 'src/components/core/MenuItem';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { MapState } from 'src/store/types';
import { getGravatarUrl } from 'src/utilities/gravatar';

interface MenuLink {
  display: string;
  href: string;
}

const menuLinks: MenuLink[] = [
  { display: 'My Profile', href: '/profile/display' },
  { display: 'Log Out', href: '/logout' }
];

type CSSClasses =
  | 'menu'
  | 'button'
  | 'userWrapper'
  | 'leftIcon'
  | 'username'
  | 'menuItem'
  | 'hidden';

const styles = (theme: Theme) =>
  createStyles({
    menu: {
      transform: `translateY(${theme.spacing(1)}px)`
    },
    button: {
      padding: theme.spacing(1),
      borderRadius: 30,
      order: 4,
      marginRight: -theme.spacing(1),
      '&:hover, &.active': {
        '& $username': {
          color: theme.palette.primary.main
        },
        '& $userWrapper': {
          boxShadow: '0 0 10px #bbb'
        }
      },
      '&:focus': {
        '& $username': {
          color: theme.palette.primary.main
        }
      }
    },
    userWrapper: {
      marginRight: theme.spacing(1),
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      transition: theme.transitions.create(['box-shadow']),
      [theme.breakpoints.down('md')]: {
        margin: 0,
        width: '28px',
        height: '28px'
      }
    },
    leftIcon: {
      width: '100%',
      height: '100%',
      borderRadius: '50%'
    },
    username: {
      transition: theme.transitions.create(['color']),
      [theme.breakpoints.down('md')]: {
        display: 'none'
      }
    },
    menuItem: {
      fontSize: '.9rem',
      fontFamily: 'LatoWeb',
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      }
    },
    hidden: {
      ...theme.visually.hidden
    }
  });

export type CombinedProps = StateProps & WithStyles<CSSClasses>;

interface State {
  anchorEl?: HTMLElement;
  gravatarUrl: string | undefined;
}

export class UserMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
    gravatarUrl: undefined
  };

  constructor(props: CombinedProps) {
    super(props);
  }

  mounted: boolean = false;

  handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  };

  renderMenuLink(menuLink: MenuLink) {
    const { classes } = this.props;
    return (
      <Link
        role="menuitem"
        to={menuLink.href}
        className={classes.menuItem}
        data-qa-menu-link={menuLink.display}
        key={menuLink.display}
        onClick={this.handleClose}
      >
        <MenuItem key={menuLink.display}>{menuLink.display}</MenuItem>
      </Link>
    );
  }

  setGravatarUrl(email: string) {
    getGravatarUrl(email).then(url => {
      this.setState({ gravatarUrl: url });
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps: StateProps) {
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
    if (!gravatarUrl) {
      return null;
    }
    return gravatarUrl !== 'not found' ? (
      <div className={classes.userWrapper}>
        <img src={gravatarUrl} className={classes.leftIcon} alt="Gravatar" />
      </div>
    ) : (
      <div className={classes.userWrapper}>
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
        <Hidden smDown>
          <ButtonBase
            onClick={this.handleMenu}
            className={` ${classes.button} ${anchorEl && 'active'}`}
            data-qa-user-menu
            aria-label="User Menu"
          >
            {username && (
              <React.Fragment>
                {this.renderAvatar()}
                <span className={classes.username}>{username && username}</span>
              </React.Fragment>
            )}
          </ButtonBase>
          <Menu
            anchorEl={anchorEl}
            getContentAnchorEl={undefined}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={open}
            onClose={this.handleClose}
            className={classes.menu}
          >
            {/* <MenuItem
              key="placeholder"
              aria-hidden
              className={classes.hidden}
            /> */}
            {menuLinks.map(menuLink => this.renderMenuLink(menuLink))}
          </Menu>
        </Hidden>
      </React.Fragment>
    );
  }
}

interface StateProps {
  userEmail: string;
  username: string;
}

const mapStateToProps: MapState<StateProps, {}> = (state, ownProps) => ({
  userEmail: pathOr('', ['data', 'email'], state.__resources.profile),
  username: pathOr('', ['data', 'username'], state.__resources.profile)
});

export default compose<CombinedProps, {}>(
  connect(mapStateToProps),
  withStyles(styles)
)(UserMenu);
