import Settings from '@material-ui/icons/Settings';
import * as classNames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Logo from 'src/assets/logo/logo-text.svg';
import Divider from 'src/components/core/Divider';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import ListItemText from 'src/components/core/ListItemText';
import Menu from 'src/components/core/Menu';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { MapState } from 'src/store/types';
import { isObjectStorageEnabled } from 'src/utilities/betaPrograms';
import { sendSpacingToggleEvent, sendThemeToggleEvent } from 'src/utilities/ga';
import AdditionalMenuItems from './AdditionalMenuItems';
import SpacingToggle from './SpacingToggle';
import ThemeToggle from './ThemeToggle';
import { linkIsActive } from './utils';

interface PrimaryLink {
  display: string;
  href: string;
  key: string;
}

type ClassNames =
  | 'menuGrid'
  | 'fadeContainer'
  | 'logoItem'
  | 'logoItemCompact'
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
  | 'divider'
  | 'menu'
  | 'paper'
  | 'settings'
  | 'activeSettings'
  | 'settingsBackdrop';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  menuGrid: {
    minHeight: 64,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80
    }
  },
  fadeContainer: {
    width: '100%',
    height: 'calc(100% - 80px)',
    display: 'flex',
    flexDirection: 'column'
  },
  logoItem: {
    padding: `${theme.spacing.unit + 2}px 0 ${theme.spacing.unit}px ${theme
      .spacing.unit +
      theme.spacing.unit / 2}px`
  },
  logoItemCompact: {
    padding: `${theme.spacing.unit + 2}px 0 ${theme.spacing.unit}px`
  },
  listItem: {
    cursor: 'pointer',
    borderLeft: '6px solid transparent',
    transition: theme.transitions.create([
      'background-color',
      'border-left-color'
    ]),
    padding: `${theme.spacing.unit / 2 + 6}px ${theme.spacing.unit * 4 -
      2}px ${theme.spacing.unit / 2 + 6}px ${theme.spacing.unit * 3}px`,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      '& $linkItem': {
        color: 'white'
      }
    },
    '&:focus, &:active': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      outline: 0,
      '& $linkItem': {
        color: 'white',
        zIndex: 2
      }
    }
  },
  listItemAccount: {
    '&:hover': {
      borderLeftColor: 'transparent'
    }
  },
  collapsible: {
    fontSize: '.9rem'
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: '#C9CACB',
    fontFamily: 'LatoWebBold' // we keep this bold at all times
  },
  active: {
    transition: 'border-color .7s ease-in-out',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftColor: theme.color.green,
    '&:hover': {
      borderLeftColor: theme.color.green
    }
  },
  sublinkPanel: {
    paddingLeft: theme.spacing.unit * 6,
    paddingRight: theme.spacing.unit * 2,
    fontSize: '.9rem',
    flexShrink: 0,
    listStyleType: 'none'
  },
  sublink: {
    padding: `${theme.spacing.unit / 2}px 0 ${theme.spacing.unit / 2}px ${
      theme.spacing.unit
    }px`,
    color: 'white',
    display: 'block',
    fontSize: '.8rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
      outline: 0
    }
  },
  activeLink: {
    color: 'white',
    '& $arrow': {
      transform: 'rotate(90deg)'
    }
  },
  sublinkActive: {
    textDecoration: 'underline'
  },
  arrow: {
    position: 'relative',
    top: 4,
    fontSize: '1.2rem',
    margin: '0 4px 0 -7px',
    transition: theme.transitions.create(['transform'])
  },
  spacer: {
    padding: 25
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
  },
  settings: {
    width: 30,
    margin: '24px auto 16px',
    alignItems: 'center',
    marginTop: 'auto',
    justifyContent: 'center',
    display: 'flex',
    color: '#e7e7e7',
    transition: theme.transitions.create(['color']),
    '& svg': {
      transition: theme.transitions.create(['transform'])
    },
    '&:hover': {
      color: theme.color.green
    }
  },
  activeSettings: {
    color: theme.color.green,
    '& svg': {
      transform: 'rotate(90deg)'
    }
  },
  menu: {},
  paper: {
    maxWidth: 350,
    padding: 8,
    position: 'absolute',
    backgroundColor: theme.bg.navy,
    border: '1px solid #999',
    outline: 0
  },
  settingsBackdrop: {
    backgroundColor: 'rgba(0,0,0,.3)'
  }
});

interface Props extends WithStyles<ClassNames>, RouteComponentProps<{}> {
  closeMenu: () => void;
  toggleTheme: () => void;
  toggleSpacing: () => void;
}

interface State {
  drawerOpen: boolean;
  expandedMenus: Record<string, boolean>;
  primaryLinks: PrimaryLink[];
  anchorEl?: HTMLElement;
}

type CombinedProps = Props & StateProps & WithTheme;

export class PrimaryNav extends React.Component<CombinedProps, State> {
  state: State = {
    drawerOpen: false,
    expandedMenus: {
      account: false,
      support: false
    },
    primaryLinks: [],
    anchorEl: undefined
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
      betaPrograms
    } = this.props;

    const primaryLinks: PrimaryLink[] = [
      { display: 'Dashboard', href: '/dashboard', key: 'dashboard' }
    ];

    // if (canAccessLinodes) {
    primaryLinks.push({ display: 'Linodes', href: '/linodes', key: 'linodes' });
    // }

    // if (canAccessVolumes) {
    primaryLinks.push({ display: 'Volumes', href: '/volumes', key: 'volumes' });
    // }

    if (isObjectStorageEnabled(betaPrograms)) {
      primaryLinks.push({
        display: 'Object Storage',
        href: '/object-storage/buckets',
        key: 'objectStorage'
      });
    }

    // if (canAccessNodeBalancers) {
    primaryLinks.push({
      display: 'NodeBalancers',
      href: '/nodebalancers',
      key: 'nodebalancers'
    });
    // }

    // if (canAccessDomains) {
    primaryLinks.push({ display: 'Domains', href: '/domains', key: 'domains' });
    // }

    // if (isLongviewEnabled) {
    primaryLinks.push({
      display: 'Longview',
      href: '/longview',
      key: 'longview'
    });
    // }

    if (isManagedAccount) {
      primaryLinks.push({
        display: 'Managed',
        href: '/managed',
        key: 'managed'
      });
    }

    // if(canAccessStackscripts){
    primaryLinks.push({
      display: 'StackScripts',
      href: '/stackscripts',
      key: 'stackscripts'
    });
    // }

    // if(canAccessImages){
    primaryLinks.push({ display: 'Images', href: '/images', key: 'images' });
    // }

    if (hasAccountAccess) {
      primaryLinks.push({
        display: 'Account',
        href: '/account/billing',
        key: 'account'
      });
    }

    this.setState({ primaryLinks });
  };

  navigate = (href: string) => {
    const { history, closeMenu } = this.props;
    history.push(href);
    closeMenu();
  };

  expandMenutItem = (e: React.MouseEvent<HTMLElement>) => {
    const menuName = e.currentTarget.getAttribute('data-menu-name');
    if (!menuName) {
      return;
    }
    this.setState({
      expandedMenus: {
        ...this.state.expandedMenus,
        [menuName]: !this.state.expandedMenus[menuName]
      }
    });
  };

  goToHelp = () => {
    this.navigate('/support');
  };

  goToProfile = () => {
    this.navigate('/profile/display');
  };

  logOut = () => {
    this.navigate('/logout');
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  };

  handleSpacingToggle = () => {
    const { toggleSpacing, theme } = this.props;
    const { spacing: spacingUnit } = theme;
    // Checking the previous spacingUnit value to determine which way to switch.
    const eventLabel = spacingUnit.unit === 8 ? 'compact' : 'normal';
    toggleSpacing();
    sendSpacingToggleEvent(eventLabel);
  };

  handleThemeToggle = () => {
    const { toggleTheme, theme } = this.props;
    // Checking the previous theme.name value to determine which way to switch.
    const eventLabel = theme.name === 'darkTheme' ? 'light' : 'dark';

    toggleTheme();
    sendThemeToggleEvent(eventLabel);
  };

  renderPrimaryLink = (primaryLink: PrimaryLink, isLast: boolean) => {
    const { classes } = this.props;

    return (
      <React.Fragment key={primaryLink.key}>
        <Link
          role="menuitem"
          to={primaryLink.href}
          href="javascript:void(0)"
          onClick={this.props.closeMenu}
          data-qa-nav-item={primaryLink.key}
          className={classNames({
            [classes.listItem]: true,
            [classes.active]: linkIsActive(primaryLink.href)
          })}
        >
          <ListItemText
            primary={primaryLink.display}
            disableTypography={true}
            className={classNames({
              [classes.linkItem]: true
            })}
          />
        </Link>
        <Divider className={classes.divider} />
      </React.Fragment>
    );
  };

  render() {
    const { classes, theme } = this.props;
    const { expandedMenus, anchorEl } = this.state;
    const { spacing: spacingUnit } = theme;

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
          component="nav"
          role="menu"
        >
          <Grid item>
            {spacingUnit.unit === 8 ? (
              <div className={classes.logoItem}>
                <Link to={`/dashboard`}>
                  <Logo width={115} height={43} />
                </Link>
              </div>
            ) : (
              <div className={classes.logoItemCompact}>
                <Link to={`/dashboard`}>
                  <Logo width={100} height={37} />
                </Link>
              </div>
            )}
          </Grid>
          <div
            className={classNames({
              ['fade-in-table']: true,
              [classes.fadeContainer]: true
            })}
          >
            {this.state.primaryLinks.map((primaryLink, id, arr) =>
              this.renderPrimaryLink(primaryLink, id === arr.length - 1)
            )}

            {/** menu items under the main navigation links */}
            <AdditionalMenuItems
              linkClasses={(href?: string) =>
                classNames({
                  [classes.listItem]: true,
                  [classes.active]: href ? linkIsActive(href) : false
                })
              }
              listItemClasses={classNames({
                [classes.linkItem]: true
              })}
              closeMenu={this.props.closeMenu}
              dividerClasses={classes.divider}
            />

            <Hidden mdUp>
              <Divider className={classes.divider} />
              <Link
                role="menuitem"
                to="/profile/display"
                href="javascript:void(0)"
                onClick={this.props.closeMenu}
                data-qa-nav-item="/profile/display"
                className={classNames({
                  [classes.listItem]: true,
                  [classes.active]:
                    expandedMenus.support ||
                    linkIsActive('/profile/display') === true
                })}
              >
                <ListItemText
                  primary="My Profile"
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true
                  })}
                />
              </Link>
              <Link
                role="menuitem"
                to="/logout"
                href="javascript:void(0)"
                onClick={this.props.closeMenu}
                data-qa-nav-item="/logout"
                className={classNames({
                  [classes.listItem]: true
                })}
              >
                <ListItemText
                  primary="Log Out"
                  disableTypography={true}
                  className={classNames({
                    [classes.linkItem]: true
                  })}
                />
              </Link>
            </Hidden>
            <div className={classes.spacer} />
            <IconButton
              onClick={this.handleClick}
              className={classNames({
                [classes.settings]: true,
                [classes.activeSettings]: anchorEl
              })}
            >
              <Settings />
            </IconButton>
            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}
              getContentAnchorEl={undefined}
              PaperProps={{ square: true, className: classes.paper }}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              className={classes.menu}
              BackdropProps={{
                className: classes.settingsBackdrop,
                'data-qa-backdrop': true
              }}
            >
              <ThemeToggle toggleTheme={this.handleThemeToggle} />
              <SpacingToggle toggleSpacing={this.handleSpacingToggle} />
            </Menu>
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
  betaPrograms: string[];
}

const userHasAccountAccess = (profile: Linode.Profile) => {
  if (profile.restricted === false) {
    return true;
  }

  const { grants } = profile;
  if (!grants) {
    return false;
  }

  return Boolean(grants.global.account_access);
};

const accountHasManaged = (account: Linode.AccountSettings) => account.managed;

// const accountHasLongviewSubscription = (account: Linode.AccountSettings) => Boolean(account.longview_subscription);

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => {
  const account = state.__resources.accountSettings.data;
  const profile = state.__resources.profile.data;

  if (!account || !profile) {
    return {
      hasAccountAccess: false,
      isManagedAccount: false,
      // isLongviewEnabled: false,
      betaPrograms: []
    };
  }

  return {
    hasAccountAccess: userHasAccountAccess(profile),
    isManagedAccount: accountHasManaged(account),
    // isLongviewEnabled: accountHasLongviewSubscription(account),
    betaPrograms: pathOr(
      [],
      ['__resources', 'profile', 'data', 'beta_programs'],
      state
    )
  };
};

const connected = connect(mapStateToProps);

export default withStyles(styles, { withTheme: true })(
  withRouter(connected(PrimaryNav))
);
