import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import {
  Menu as ReachMenu,
  MenuButton,
  MenuItems,
  MenuLink,
  MenuLinkProps,
  MenuPopover
} from '@reach/menu-button';
import * as classNames from 'classnames';
import * as React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import Community from 'src/assets/community.svg';
import Dashboard from 'src/assets/icons/dashboard_cmr.svg';
import Gear from 'src/assets/icons/gear.svg';
import Logo from 'src/assets/logo/new-logo.svg';
import LogoIcon from 'src/assets/logo/logo.svg';
import Help from 'src/assets/primary-nav-help.svg';
import Grid from 'src/components/core/Grid';
import Hidden, { HiddenProps } from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import ListItemText from 'src/components/core/ListItemText';
import Menu from 'src/components/core/Menu';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import { Link } from 'src/components/Link';
import UserMenu from 'src/features/TopMenu/UserMenu/UserMenu_CMR';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useDomains from 'src/hooks/useDomains';
import useFlags from 'src/hooks/useFlags';
import usePrefetch from 'src/hooks/usePreFetch';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import usePrimaryNavStyles from './PrimaryNav_CMR.styles';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';

type NavEntity =
  | 'Linodes'
  | 'Volumes'
  | 'NodeBalancers'
  | 'Domains'
  | 'Longview'
  | 'Kubernetes'
  | 'Object Storage'
  | 'Managed'
  | 'Marketplace'
  | 'Images'
  | 'Firewalls'
  | 'Account'
  | 'Dashboard'
  | 'StackScripts'
  | 'Help & Support'
  | 'Community'
  | 'Virtual LANs';

type NavGroup =
  | 'Compute'
  | 'Network'
  | 'Storage'
  | 'Monitors'
  | 'Marketplace'
  | 'Help & Support'
  | 'Community'
  | 'None';

interface PrimaryLink {
  display: NavEntity;
  href: string;
  attr?: { [key: string]: any };
  icon?: JSX.Element;
  activeLinks?: Array<string>;
  onClick?: (e: React.ChangeEvent<any>) => void;
  hide?: boolean;
  prefetchRequestFn?: () => void;
  prefetchRequestCondition?: boolean;
}

// =============================================================================
// PrimaryNav
// =============================================================================
export interface PrimaryNavProps {
  closeMenu: () => void;
  isCollapsed: boolean;
  toggleTheme: () => void;
}

export const PrimaryNav: React.FC<PrimaryNavProps> = props => {
  const classes = usePrimaryNavStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMobile = useMediaQuery('(max-width:750px)');
  const matchesTablet = useMediaQuery('(max-width:1190px)');

  const { closeMenu, isCollapsed, toggleTheme } = props;

  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLElement) | undefined
  >();

  const flags = useFlags();
  const { domains, requestDomains } = useDomains();

  const {
    _isManagedAccount,
    _isLargeAccount,
    account
  } = useAccountManagement();

  const showFirewalls = isFeatureEnabled(
    'Cloud Firewall',
    Boolean(flags.firewalls),
    account?.data?.capabilities ?? []
  );

  const showVlans = true;

  // const showVlans = isFeatureEnabled(
  //   'Vlans',
  //   Boolean(flags.vlans),
  //   account?.data?.capabilities ?? []
  // );

  const primaryLinkGroups: {
    group: NavGroup;
    links: PrimaryLink[];
  }[] = React.useMemo(
    () => [
      {
        group: 'None',
        links: [
          {
            display: 'Dashboard',
            href: '/dashboard',
            hide: !matchesMobile
          }
        ]
      },
      {
        group: 'Compute',
        links: [
          {
            display: 'Linodes',
            href: '/linodes',
            activeLinks: ['/linodes', '/linodes/create']
          },
          {
            display: 'Kubernetes',
            href: '/kubernetes/clusters'
          },
          {
            display: 'StackScripts',
            href: '/stackscripts?type=account'
          },
          {
            display: 'Images',
            href: '/images'
          }
        ]
      },
      {
        group: 'Network',
        links: [
          {
            display: 'Domains',
            href: '/domains',
            prefetchRequestFn: requestDomains,
            prefetchRequestCondition:
              !domains.loading && domains.lastUpdated === 0 && !_isLargeAccount
          },
          {
            display: 'Firewalls',
            href: '/firewalls',
            hide: !showFirewalls
          },
          {
            display: 'NodeBalancers',
            href: '/nodebalancers'
          },
          {
            display: 'Virtual LANs',
            href: '/vlans',
            hide: !showVlans
          }
        ]
      },
      {
        group: 'Storage',
        links: [
          {
            display: 'Volumes',
            href: '/volumes'
          },
          {
            display: 'Object Storage',
            href: '/object-storage/buckets',
            activeLinks: [
              '/object-storage/buckets',
              '/object-storage/access-keys'
            ]
          }
        ]
      },
      {
        group: 'Monitors',
        links: [
          {
            display: 'Longview',
            href: '/longview'
          },
          {
            display: 'Managed',
            href: '/managed',
            hide: !_isManagedAccount
          }
        ]
      },
      {
        group: 'None',
        links: [
          {
            display: 'Marketplace',
            href: '/linodes/create?type=One-Click',
            attr: { 'data-qa-one-click-nav-btn': true }
          }
        ]
      }
    ],
    [
      matchesMobile,
      requestDomains,
      domains.loading,
      domains.lastUpdated,
      _isLargeAccount,
      showFirewalls,
      showVlans,
      _isManagedAccount
    ]
  );

  return (
    <Grid
      className={classes.menuGrid}
      container
      direction="row"
      alignItems="flex-start"
      justify="flex-start"
      wrap="nowrap"
      component="nav"
      role="navigation"
      id="main-navigation"
      spacing={0}
    >
      <div className={classes.menuGridInner}>
        <div className={classes.primaryLinksContainer}>
          <Grid item>
            <div
              className={classNames({
                [classes.logoItem]: true,
                [classes.logoCollapsed]: matchesTablet
              })}
            >
              <Link to={`/dashboard`} title="Dashboard">
                {matchesTablet ? (
                  <LogoIcon width={25} height={29} />
                ) : (
                  <Logo width={101} height={29} style={{ marginRight: 15 }} />
                )}
              </Link>
            </div>
          </Grid>
          {matchesMobile && (
            <Grid item>
              <MobileNav groups={primaryLinkGroups} />
            </Grid>
          )}
          <div className={classes.hideOnMobile}>
            <Grid item>
              <div
                className={classNames({
                  [classes.logoItem]: true,
                  [classes.logoCollapsed]: matchesSmDown
                })}
              >
                {matchesSmDown ? (
                  <Link to={`/dashboard`} onClick={closeMenu} title="Dashboard">
                    <Dashboard
                      width={20}
                      height={16}
                      style={{ marginRight: 6 }}
                    />
                  </Link>
                ) : (
                  <PrimaryNavLink
                    display="Dashboard"
                    href="/dashboard"
                    closeMenu={closeMenu}
                  />
                )}
              </div>
            </Grid>
            {primaryLinkGroups.map(thisGroup => {
              // For each group, filter out hidden links.
              const filteredLinks = thisGroup.links.filter(
                thisLink => !thisLink.hide
              );
              if (filteredLinks.length === 0) {
                return null;
              }
              // Render a singular PrimaryNavLink for links without a group.
              if (thisGroup.group === 'None' && filteredLinks.length === 1) {
                const link = filteredLinks[0];

                return (
                  <PrimaryNavLink
                    key={link.display}
                    display={link.display}
                    href={link.href}
                    closeMenu={closeMenu}
                    prefetchRequestFn={link.prefetchRequestFn}
                    prefetchRequestCondition={link.prefetchRequestCondition}
                  />
                );
              }
              // Otherwise return a NavGroup (dropdown menu).
              return (
                <NavGroup
                  key={thisGroup.group}
                  group={thisGroup.group}
                  links={filteredLinks}
                />
              );
            })}
          </div>
        </div>

        <div className={classes.secondaryLinksContainer}>
          <PrimaryNavLink
            key="Help & Support"
            display="Help & Support"
            href={'/support'}
            icon={<Help />}
            closeMenu={closeMenu}
            textHiddenProps={{ mdDown: true }}
          />
          <PrimaryNavLink
            key="Community"
            display="Community"
            href="https://www.linode.com/community"
            icon={<Community />}
            closeMenu={closeMenu}
            textHiddenProps={{ mdDown: true }}
          />
          <IconButton
            aria-label="User settings"
            className={classNames({
              [classes.settings]: true,
              [classes.settingsCollapsed]: isCollapsed,
              [classes.activeSettings]: !!anchorEl
            })}
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              setAnchorEl(event.currentTarget);
            }}
          >
            <Gear />
          </IconButton>
          <Menu
            id="settings-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => {
              setAnchorEl(undefined);
            }}
            getContentAnchorEl={undefined}
            PaperProps={{ square: true, className: classes.paper }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <ThemeToggle toggleTheme={toggleTheme} />
          </Menu>
          <UserMenu />
        </div>
      </div>
    </Grid>
  );
};

export default React.memo(PrimaryNav);

// =============================================================================
// NavGroup
// =============================================================================
export interface NavGroupProps {
  group: NavGroup;
  links: PrimaryLink[];
}

export const NavGroup: React.FC<NavGroupProps> = props => {
  const classes = usePrimaryNavStyles();

  const { group, links } = props;

  return (
    <div className={classes.menuWrapper}>
      <ReachMenu>
        <MenuButton
          className={`${classes.menuButton} ${classes.linkItem}`}
          data-testid={`nav-group-${group}`}
        >
          {group}
          <KeyboardArrowDown className={classes.caret} />
        </MenuButton>
        <MenuPopover className={classes.menuPopover} portal={false}>
          <MenuItems className={classes.menuItemList}>
            {links.map(thisLink => {
              const {
                display,
                href,
                prefetchRequestCondition,
                prefetchRequestFn
              } = thisLink;

              return (
                <PrimaryNavMenuLink
                  key={display}
                  to={href}
                  display={display}
                  prefetchRequestFn={prefetchRequestFn}
                  prefetchRequestCondition={prefetchRequestCondition}
                >
                  {display}
                </PrimaryNavMenuLink>
              );
            })}
          </MenuItems>
        </MenuPopover>
      </ReachMenu>
    </div>
  );
};

// =============================================================================
// PrimaryNavMenuLink
// =============================================================================
interface PrimaryNavMenuLinkProps extends MenuLinkProps {
  display: string;
  prefetchRequestFn?: () => void;
  prefetchRequestCondition?: boolean;
  to: string;
}

export const PrimaryNavMenuLink: React.FC<PrimaryNavMenuLinkProps> = React.memo(
  props => {
    const classes = usePrimaryNavStyles();

    const {
      display,
      prefetchRequestFn,
      prefetchRequestCondition,
      ...rest
    } = props;

    const { handlers } = usePrefetch(
      prefetchRequestFn,
      prefetchRequestCondition
    );

    return (
      <MenuLink
        as={ReactRouterLink}
        className={classes.menuItemLink}
        data-testid={`menu-item-${display}`}
        {...handlers}
        {...rest}
      >
        {display}
      </MenuLink>
    );
  }
);

// =============================================================================
// PrimaryNavLink
// =============================================================================
interface PrimaryNavLink extends PrimaryLink {
  closeMenu: () => void;
  prefetchRequestFn?: () => void;
  prefetchRequestCondition?: boolean;
  textHiddenProps?: HiddenProps;
}

export const PrimaryNavLink: React.FC<PrimaryNavLink> = React.memo(props => {
  const classes = usePrimaryNavStyles();

  const { handlers } = usePrefetch(
    props.prefetchRequestFn,
    props.prefetchRequestCondition
  );

  const {
    closeMenu,
    href,
    onClick,
    attr,
    icon,
    display,
    textHiddenProps: hiddenProps
  } = props;

  // @todo: handle external link
  return (
    <Link
      to={href}
      className={classes.listItem}
      onClick={(e: React.ChangeEvent<any>) => {
        closeMenu();
        if (onClick) {
          onClick(e);
        }
      }}
      {...handlers}
      {...attr}
    >
      {icon && (
        <div className={`icon ${classes.primaryNavLinkIcon}`}>{icon}</div>
      )}
      <Hidden {...hiddenProps}>
        <ListItemText
          primary={display}
          className={classNames({
            [classes.linkItem]: true,
            primaryNavLink: true
          })}
          disableTypography={true}
        />
      </Hidden>
    </Link>
  );
});
