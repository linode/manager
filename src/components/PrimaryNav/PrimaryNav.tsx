import Settings from '@material-ui/icons/Settings';
import * as classNames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Logo from 'src/assets/logo/logo-text.svg';
import Divider from 'src/components/core/Divider';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import ListItemText from 'src/components/core/ListItemText';
import Menu from 'src/components/core/Menu';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { isKubernetesEnabled } from 'src/constants';
import { MapState } from 'src/store/types';
import { NORMAL_SPACING_UNIT } from 'src/themeFactory';
import { isObjectStorageEnabled } from 'src/utilities/accountCapabilities';
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

const styles = (theme: Theme) =>
  createStyles({
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
      height: 'calc(100% - 90px)',
      display: 'flex',
      flexDirection: 'column'
    },
    logoItem: {
      padding: `${theme.spacing(1) + 2}px 0 ${theme.spacing(
        1
      )}px ${theme.spacing(1) + theme.spacing(1) / 2}px`
    },
    logoItemCompact: {
      padding: `${theme.spacing(1) + 2}px 0 ${theme.spacing(1)}px`
    },
    listItem: {
      position: 'relative',
      cursor: 'pointer',
      transition: theme.transitions.create(['background-color']),
      padding: `${theme.spacing(2)}px ${theme.spacing(4) - 2}px ${theme.spacing(
        2
      ) - 1}px ${theme.spacing(4) + 1}px`,
      '&:hover': {
        backgroundColor: '#272b31',
        '& $linkItem': {
          color: 'white'
        }
      }
    },
    collapsible: {
      fontSize: '0.9rem'
    },
    linkItem: {
      transition: theme.transitions.create(['color']),
      color: theme.color.primaryNavText,
      fontFamily: 'LatoWebBold' // we keep this bold at all times
    },
    active: {
      backgroundColor: '#272b31',
      '&:before': {
        content: "''",
        borderStyle: 'solid',
        borderWidth: `${theme.spacing(2) + 5}px ${theme.spacing(
          2
        )}px ${theme.spacing(2) + 5}px 0`,
        borderColor: `transparent ${
          theme.bg.primaryNavActive
        } transparent transparent`,
        position: 'absolute',
        right: 0,
        top: '8%'
      },
      '&:hover': {
        '&:before': {
          content: "''",
          borderStyle: 'solid',
          borderWidth: `${theme.spacing(2) + 5}px ${theme.spacing(
            2
          )}px ${theme.spacing(2) + 5}px 0`,
          borderColor: `transparent ${
            theme.bg.primaryNavActive
          } transparent transparent`,
          position: 'absolute',
          right: 0,
          top: '8%'
        }
      }
    },
    sublinkPanel: {
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(2),
      fontSize: '.9rem',
      flexShrink: 0,
      listStyleType: 'none'
    },
    sublink: {
      padding: `${theme.spacing(1) / 2}px 0 ${theme.spacing(1) /
        2}px ${theme.spacing(1)}px`,
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
      outline: 0,
      boxShadow: 'none',
      minWidth: 185
    },
    settingsBackdrop: {
      backgroundColor: 'rgba(0,0,0,.3)'
    }
  });

interface Props {
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

export type CombinedProps = Props &
  StateProps &
  WithTheme &
  WithStyles<ClassNames> &
  RouteComponentProps<{}>;

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
    // Re-create menu items if account access has changed (via profile), or if account
    // has been updated. If account has been updated (i.e. when it actually loads)
    // there maybe be additional menu items we want to display, depending on
    // `account.capabilities`.
    if (
      prevProps.hasAccountAccess !== this.props.hasAccountAccess ||
      prevProps.isManagedAccount !== this.props.isManagedAccount ||
      prevProps.accountLastUpdated !== this.props.accountLastUpdated
    ) {
      this.createMenuItems();
    }
  }

  createMenuItems = () => {
    const {
      hasAccountAccess,
      // isLongviewEnabled,
      isManagedAccount,
      accountCapabilities
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

    if (isObjectStorageEnabled(accountCapabilities)) {
      primaryLinks.push({
        display: 'Object Storage',
        href: '/object-storage/buckets',
        key: 'object-storage'
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

    if (isKubernetesEnabled) {
      primaryLinks.push({
        display: 'Kubernetes',
        href: '/kubernetes',
        key: 'kubernetes'
      });
    }

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
    const { toggleSpacing } = this.props;
    // Checking the previous spacingUnit value to determine which way to switch.
    const eventLabel = NORMAL_SPACING_UNIT ? 'compact' : 'normal';
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
    const { classes } = this.props;
    const { expandedMenus, anchorEl } = this.state;

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
            {NORMAL_SPACING_UNIT ? (
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
                className: classes.settingsBackdrop
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
  accountCapabilities: Linode.AccountCapability[];
  accountLastUpdated: number;
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
  const accountLastUpdated = state.__resources.account.lastUpdated;

  if (!account || !profile) {
    return {
      hasAccountAccess: false,
      isManagedAccount: false,
      // isLongviewEnabled: false,
      accountCapabilities: [],
      accountLastUpdated
    };
  }

  return {
    hasAccountAccess: userHasAccountAccess(profile),
    isManagedAccount: accountHasManaged(account),
    // isLongviewEnabled: accountHasLongviewSubscription(account),
    accountCapabilities: pathOr(
      [],
      ['__resources', 'account', 'data', 'capabilities'],
      state
    ),
    accountLastUpdated
  };
};

const connected = connect(mapStateToProps);

const styled = withStyles(styles, { withTheme: true });

export default compose<CombinedProps, Props>(
  withRouter,
  connected,
  styled
)(PrimaryNav);
