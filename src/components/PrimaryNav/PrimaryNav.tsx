import * as classNames from 'classnames';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Logo from 'src/assets/logo/logo-text.svg';
import Divider from 'src/components/core/Divider';
import Hidden from 'src/components/core/Hidden';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import ThemeToggle from './ThemeToggle';

interface PrimaryLink {
  display: string;
  href: string;
  key: string;
};

type ClassNames =
  'menuGrid'
  | 'fadeContainer'
  | 'logoItem'
  | 'listItem'
  | 'collapsible'
  | 'linkItem'
  | 'active'
  | 'activeLink'
  | 'sublink'
  | 'sublinkActive'
  | 'arrow'
  | 'sublinkPanel'
  | 'spacer'
  | 'listItemAccount'
  | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  menuGrid: {
    minHeight: 64,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
  },
  fadeContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  logoItem: {
    padding: '10px 0 8px 26px',
  },
  listItem: {
    padding: '16px 40px 16px 34px',
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    borderLeft: '6px solid transparent',
    transition: theme.transitions.create(['background-color', 'border-left-color']),
    flexShrink: 0,
    [theme.breakpoints.down('md')]: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    '&:hover': {
      borderLeftColor: 'rgba(0, 0, 0, 0.1)',
      '& $linkItem': {
        color: 'white',
      },
    },
    '&:focus, &:active': {
      '& $linkItem': {
        color: 'white',
        zIndex: 2,
      },
    },
  },
  listItemAccount: {
    '&:hover': {
      borderLeftColor: 'transparent',
    },
  },
  collapsible: {
    fontSize: '.9rem',
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: '#C9CACB',
    fontFamily: 'LatoWebBold',
  },
  active: {
    transition: 'border-color .7s ease-in-out',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftColor: theme.color.green,
    '&:hover': {
      borderLeftColor: theme.color.green,
    },
  },
  sublinkPanel: {
    paddingLeft: theme.spacing.unit * 6,
    paddingRight: theme.spacing.unit * 2,
    fontSize: '.9rem',
    flexShrink: 0,
    listStyleType: 'none',
  },
  sublink: {
    padding: '4px 0 4px 8px',
    color: 'white',
    display: 'block',
    fontSize: '.8rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
      outline: 0,
    },
  },
  activeLink: {
    color: 'white',
    '& $arrow': {
      transform: 'rotate(90deg)',
    },
  },
  sublinkActive: {
    textDecoration: 'underline',
  },
  arrow: {
    position: 'relative',
    top: 4,
    fontSize: '1.2rem',
    margin: '0 4px 0 -7px',
    transition: theme.transitions.create(['transform']),
  },
  spacer: {
    padding: 25,
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
});

interface Props extends WithStyles<ClassNames>, RouteComponentProps<{}> {
  closeMenu: () => void;
  toggleTheme: () => void;
}

interface State {
  drawerOpen: boolean;
  expandedMenus: Record<string, boolean>;
  primaryLinks: PrimaryLink[];
}

type CombinedProps = Props & StateProps;

export class PrimaryNav extends React.Component<CombinedProps, State> {
  state: State = {
    drawerOpen: false,
    expandedMenus: {
      account: false,
      support: false,
    },
    primaryLinks: [],
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.createMenuItems();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.hasAccountAccess !== this.props.hasAccountAccess) {
      this.createMenuItems();
    }
  }

  createMenuItems = () => {
    const {
      hasAccountAccess,
      // isLongviewEnabled,
      isManagedAccount,
    } = this.props;

    const primaryLinks = [
      { display: 'Dashboard', href: '/dashboard', key: 'dashboard' }
    ];

    // if (canAccessLinodes) {
    primaryLinks.push({ display: 'Linodes', href: '/linodes', key: 'linodes' });
    // }

    // if (canAccessVolumes) {
    primaryLinks.push({ display: 'Volumes', href: '/volumes', key: 'volumes' });
    // }

    // if (canAccessNodeBalancers) {
    primaryLinks.push({ display: 'NodeBalancers', href: '/nodebalancers', key: 'nodebalancers' });
    // }

    // if (canAccessDomains) {
    primaryLinks.push({ display: 'Domains', href: '/domains', key: 'domains' });
    // }

    // if (isLongviewEnabled) {
    primaryLinks.push({ display: 'Longview', href: '/longview', key: 'longview' });
    // }

    if (isManagedAccount) {
      primaryLinks.push({ display: 'Managed', href: '/managed', key: 'managed' });
    }

    // if(canAccessStackscripts){
    primaryLinks.push({ display: 'StackScripts', href: '/stackscripts', key: 'stackscripts' });
    // }

    // if(canAccessImages){
    primaryLinks.push({ display: 'Images', href: '/images', key: 'images' });
    // }

    if (hasAccountAccess) {
      primaryLinks.push({ display: 'Account', href: '/account', key: 'account' });
    }

    primaryLinks.push({ display: 'Get Help', href: '/support', key: 'support' });

    this.setState({ primaryLinks });
  };

  navigate = (href: string) => {
    const { history, closeMenu } = this.props;
    history.push(href);
    closeMenu();
  }

  linkIsActive = (href: string) => {
    return isPathOneOf([href], this.props.location.pathname);
  }

  expandMenutItem = (e: React.MouseEvent<HTMLElement>) => {
    const menuName = e.currentTarget.getAttribute('data-menu-name');
    if (!menuName) { return };
    this.setState({
      expandedMenus: {
        ...this.state.expandedMenus,
        [menuName]: !this.state.expandedMenus[menuName],
      }
    });
  };

  goToHelp = () => {
    this.navigate('/support');
  }

  goToProfile = () => {
    this.navigate('/profile');
  }

  logOut = () => {
    this.navigate('/logout');
  }

  renderPrimaryLink = (primaryLink: PrimaryLink, isLast: boolean) => {
    const { classes } = this.props;

    return (
      <ListItem
        key={primaryLink.display}
        button
        divider={!isLast}
        component="li"
        role="menuitem"
        focusRipple={true}
        onClick={() => this.navigate(primaryLink.href)}
        className={`
          ${classes.listItem}
          ${this.linkIsActive(primaryLink.href) && classes.active}
        `}
        data-qa-nav-item={primaryLink.key}
      >
        <ListItemText
          primary={primaryLink.display}
          disableTypography={true}
          className={`
            ${classes.linkItem}
            ${this.linkIsActive(primaryLink.href) && classes.activeLink}
          `}
        />
      </ListItem>
    );
  }

  render() {
    const { classes, toggleTheme } = this.props;
    const { expandedMenus } = this.state;

    return (
      <React.Fragment>
        <Grid
          className={classes.menuGrid}
          container
          alignItems="flex-start"
          justify="flex-start"
          direction="column"
          wrap="nowrap"
          spacing={0}
          component="ul"
          role="menu"
        >
          <Grid item>
            <div className={classes.logoItem}>
              <Link to={`/dashboard`}>
                <Logo width={115} height={43} />
              </Link>
            </div>
          </Grid>
          <div className={classNames({
            ['fade-in-table']: true,
            [classes.fadeContainer]: true,
          })}>

            {this.state.primaryLinks.map((primaryLink, id, arr) =>
              this.renderPrimaryLink(primaryLink, id === arr.length - 1))}

            <Hidden mdUp>
              <Divider className={classes.divider} />
              <ListItem
                button
                component="li"
                focusRipple={true}
                onClick={this.goToProfile}
                className={classNames({
                  [classes.listItem]: true,
                  [classes.collapsible]: true,
                  [classes.active]: this.linkIsActive('/profile') === true,
                })}
              >
                <ListItemText
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true,
                    [classes.activeLink]:
                      expandedMenus.support
                      || this.linkIsActive('/profile') === true,
                  })}
                >
                  My Profile
                </ListItemText>
              </ListItem>
              <ListItem
                button
                component="li"
                focusRipple={true}
                onClick={this.logOut}
                className={classNames({
                  [classes.listItem]: true,
                  [classes.collapsible]: true,
                  [classes.active]: this.linkIsActive('/logout') === true,
                })}
              >
                <ListItemText
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true,
                    [classes.activeLink]:
                      expandedMenus.support
                      || this.linkIsActive('/logout') === true,
                  })}
                >
                  Log Out
                </ListItemText>
              </ListItem>
            </Hidden>
            <div className={classes.spacer} />
            <ThemeToggle toggleTheme={toggleTheme} />
          </div>
        </Grid>
      </React.Fragment>
    );
  }
}

interface StateProps {
  hasAccountAccess: boolean;
  isManagedAccount: boolean;
  // isLongviewEnabled: boolean;
}

const userHasAccountAccess = (profile: Linode.Profile) => {
  if (profile.restricted === false) {
    return true;
  }

  const { grants } = profile;
  if (!grants) {
    return false;
  }

  return Boolean(grants.global.account_access)
};

const accountHasManaged = (account: Linode.AccountSettings) => account.managed;

// const accountHasLongviewSubscription = (account: Linode.AccountSettings) => Boolean(account.longview_subscription);

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state, ownProps) => {
  const account = state.__resources.accountSettings.data;
  const profile = state.__resources.profile.data;

  if (!account || !profile) {
    return {
      hasAccountAccess: false,
      isManagedAccount: false,
      // isLongviewEnabled: false,
    }
  }

  return {
    hasAccountAccess: userHasAccountAccess(profile),
    isManagedAccount: accountHasManaged(account),
    // isLongviewEnabled: accountHasLongviewSubscription(account),
  }
};


const connected = connect(mapStateToProps);

export default withStyles(styles)(withRouter(connected(PrimaryNav)));
