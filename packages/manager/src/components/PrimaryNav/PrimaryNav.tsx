import Settings from '@material-ui/icons/Settings';
import * as classNames from 'classnames';
import { AccountCapability } from 'linode-js-sdk/lib/account';
import { Profile } from 'linode-js-sdk/lib/profile';
import { clone, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Logo from 'src/assets/logo/new-logo.svg';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import ListItemText from 'src/components/core/ListItemText';
import Menu from 'src/components/core/Menu';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import { MapState } from 'src/store/types';
import {
  isKubernetesEnabled,
  isObjectStorageEnabled
} from 'src/utilities/accountCapabilities';
import { sendOneClickNavigationEvent } from 'src/utilities/ga';
import AdditionalMenuItems from './AdditionalMenuItems';
import styled, { StyleProps } from './PrimaryNav.styles';
import SpacingToggle from './SpacingToggle';
import ThemeToggle from './ThemeToggle';
import { linkIsActive } from './utils';

import Kubernetes from 'src/assets/addnewmenu/kubernetes.svg';
import OCA from 'src/assets/addnewmenu/oneclick.svg';
import Account from 'src/assets/icons/account.svg';
import Dashboard from 'src/assets/icons/dashboard.svg';
import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Domain from 'src/assets/icons/entityIcons/domain.svg';
import Image from 'src/assets/icons/entityIcons/image.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import StackScript from 'src/assets/icons/entityIcons/stackscript.svg';
import Volume from 'src/assets/icons/entityIcons/volume.svg';
import Firewall from 'src/assets/icons/firewall.svg';
import Longview from 'src/assets/icons/longview.svg';
import Managed from 'src/assets/icons/managednav.svg';

type Entity =
  | 'Linodes'
  | 'Volumes'
  | 'NodeBalancers'
  | 'Domains'
  | 'Longview'
  | 'Kubernetes'
  | 'Object Storage'
  | 'Managed'
  | 'One-Click Apps'
  | 'Images'
  | 'Firewalls'
  | 'Account'
  | 'Dashboard'
  | 'StackScripts';

interface PrimaryLink {
  display: Entity;
  href: string;
  key: string;
  attr?: { [key: string]: any };
  icon?: JSX.Element;
  onClick?: (e: React.ChangeEvent<any>) => void;
}

interface Props {
  closeMenu: () => void;
  toggleTheme: () => void;
  toggleSpacing: () => void;
  isCollapsed: boolean;
}

interface State {
  drawerOpen: boolean;
  expandedMenus: Record<string, boolean>;
  primaryLinks: PrimaryLink[];
  anchorEl?: HTMLElement;
}

interface MenuItemReducer {
  link: PrimaryLink;
  insertAfter: Entity;
  conditionToAdd: () => boolean;
}

export type CombinedProps = Props &
  StyleProps &
  StateProps &
  FeatureFlagConsumerProps &
  FeatureFlagConsumerProps &
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
      prevProps.accountLastUpdated !== this.props.accountLastUpdated ||
      prevProps.isManagedAccount !== this.props.isManagedAccount ||
      prevProps.accountLastUpdated !== this.props.accountLastUpdated ||
      prevProps.flags !== this.props.flags
    ) {
      this.createMenuItems();
    }
  }

  primaryNavManipulator = (): MenuItemReducer[] => {
    const {
      hasAccountAccess,
      isManagedAccount,
      accountCapabilities,
      flags
    } = this.props;

    return [
      {
        conditionToAdd: () =>
          isObjectStorageEnabled(accountCapabilities) ||
          Boolean(flags.objectStorage),
        insertAfter: 'Volumes',
        link: {
          display: 'Object Storage',
          href: '/object-storage/buckets',
          key: 'object-storage',
          icon: <Storage />
        }
      },
      {
        conditionToAdd: () => isManagedAccount,
        insertAfter: 'Longview',
        link: {
          display: 'Managed',
          href: '/managed',
          key: 'managed',
          icon: <Managed />
        }
      },
      {
        conditionToAdd: () => isKubernetesEnabled(accountCapabilities),
        insertAfter: 'Longview',
        link: {
          display: 'Kubernetes',
          href: '/kubernetes/clusters',
          key: 'kubernetes',
          icon: <Kubernetes />
        }
      },
      {
        conditionToAdd: () => flags.oneClickLocation === 'sidenav',
        insertAfter: 'Longview',
        link: {
          display: 'One-Click Apps',
          href: '/linodes/create?type=One-Click',
          key: 'one-click',
          attr: { 'data-qa-one-click-nav-btn': true },
          icon: <OCA />,
          onClick: () => {
            sendOneClickNavigationEvent('Primary Nav');
          }
        }
      },
      {
        conditionToAdd: () => hasAccountAccess,
        insertAfter: 'Images',
        link: {
          display: 'Account',
          href: '/account/billing',
          key: 'account',
          icon: <Account className="small" />
        }
      },
      {
        conditionToAdd: () => !!flags.firewalls,
        insertAfter: 'Domains',
        link: {
          display: 'Firewalls',
          href: '/firewalls',
          key: 'firewalls',
          icon: <Firewall />
        }
      }
    ];
  };

  createMenuItems = () => {
    const primaryLinks: PrimaryLink[] = [
      {
        display: 'Dashboard',
        href: '/dashboard',
        key: 'dashboard',
        icon: <Dashboard className="small" />
      },
      {
        display: 'Linodes',
        href: '/linodes',
        key: 'linodes',
        icon: <Linode />
      },
      {
        display: 'Volumes',
        href: '/volumes',
        key: 'volumes',
        icon: <Volume />
      },
      {
        display: 'NodeBalancers',
        href: '/nodebalancers',
        key: 'nodebalancers',
        icon: <NodeBalancer />
      },
      {
        display: 'Domains',
        href: '/domains',
        key: 'domains',
        icon: <Domain style={{ transform: 'scale(1.5)' }} />
      },
      {
        display: 'Longview',
        href: '/longview',
        key: 'longview',
        icon: <Longview className="small" />
      },
      {
        display: 'StackScripts',
        href: '/stackscripts',
        key: 'stackscripts',
        icon: <StackScript />
      },
      {
        display: 'Images',
        href: '/images',
        key: 'images',
        icon: <Image className="small" />
      }
    ];

    const potentialMenuItemsToAdd = this.primaryNavManipulator();

    const finalMenuItems: PrimaryLink[] = potentialMenuItemsToAdd.reduce(
      (acc, eachItem) => {
        const indexOfFoundNavItem = acc.findIndex(
          eachNavItem => eachNavItem.display === eachItem.insertAfter
        );

        /**
         * if our passed boolean condition evaluates true,
         * add it to the list of primary nav items.
         */
        if (eachItem.conditionToAdd()) {
          acc.splice(indexOfFoundNavItem + 1, 0, eachItem.link);
        }

        return acc;
      },
      clone(primaryLinks)
    );

    this.setState({ primaryLinks: finalMenuItems });
  };

  navigate = (href: string) => {
    const { history, closeMenu } = this.props;
    history.push(href);
    closeMenu();
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

  renderPrimaryLink = (primaryLink: PrimaryLink, isLast: boolean) => {
    const { classes, isCollapsed } = this.props;

    return (
      <React.Fragment key={primaryLink.key}>
        <Link
          role="menuitem"
          to={primaryLink.href}
          onClick={(e: React.ChangeEvent<any>) => {
            this.props.closeMenu();
            if (primaryLink.onClick) {
              primaryLink.onClick(e);
            }
          }}
          data-qa-nav-item={primaryLink.key}
          {...primaryLink.attr}
          className={classNames({
            [classes.listItem]: true,
            [classes.active]: linkIsActive(primaryLink.href),
            listItemCollpased: isCollapsed
          })}
        >
          {primaryLink.icon && isCollapsed && (
            <div className="icon">{primaryLink.icon}</div>
          )}
          <ListItemText
            primary={primaryLink.display}
            disableTypography={true}
            className={classNames({
              [classes.linkItem]: true,
              primaryNavLink: true,
              hiddenWhenCollapsed: isCollapsed
            })}
          />
        </Link>
        <Divider className={classes.divider} />
      </React.Fragment>
    );
  };

  render() {
    const { classes, isCollapsed } = this.props;
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
            <div
              className={classNames({
                [classes.logoItem]: true,
                [classes.logoCollapsed]: isCollapsed
              })}
            >
              <Link to={`/dashboard`} onClick={() => this.props.closeMenu()}>
                <Logo width={115} height={43} />
              </Link>
            </div>
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
              isCollapsed={isCollapsed}
            />

            <Hidden mdUp>
              <Divider className={classes.divider} />
              <Link
                role="menuitem"
                to="/profile/display"
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
                [classes.settingsCollapsed]: isCollapsed,
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
              <ThemeToggle toggleTheme={this.props.toggleTheme} />
              <SpacingToggle toggleSpacing={this.props.toggleSpacing} />
            </Menu>
          </div>
        </Grid>
      </React.Fragment>
    );
  }
}

interface StateProps {
  hasAccountAccess: boolean;
  // isLongviewEnabled: boolean;
  accountCapabilities: AccountCapability[];
  accountLastUpdated: number;
  isManagedAccount: boolean;
}

const userHasAccountAccess = (profile: Profile) => {
  if (profile.restricted === false) {
    return true;
  }

  const { grants } = profile;
  if (!grants) {
    return false;
  }

  return Boolean(grants.global.account_access);
};

// const accountHasLongviewSubscription = (account: Linode.AccountSettings) => Boolean(account.longview_subscription);

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => {
  const account = state.__resources.accountSettings.data;
  const profile = state.__resources.profile.data;
  const accountLastUpdated = state.__resources.account.lastUpdated;

  if (!account || !profile) {
    return {
      hasAccountAccess: false,
      // isLongviewEnabled: false,
      accountCapabilities: [],
      accountLastUpdated,
      isManagedAccount: false
    };
  }

  return {
    hasAccountAccess: userHasAccountAccess(profile),
    // isLongviewEnabled: accountHasLongviewSubscription(account),
    accountCapabilities: pathOr(
      [],
      ['__resources', 'account', 'data', 'capabilities'],
      state
    ),
    accountLastUpdated,
    isManagedAccount: pathOr(
      false,
      ['__resources', 'accountSettings', 'data', 'managed'],
      state
    )
  };
};

const connected = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  withRouter,
  withFeatureFlagConsumer,
  connected,
  styled
)(PrimaryNav);
