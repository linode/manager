import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Settings from '@material-ui/icons/Settings';
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
import { Link } from 'react-router-dom';
import Kubernetes from 'src/assets/addnewmenu/kubernetes.svg';
import OCA from 'src/assets/addnewmenu/oneclick.svg';
import Account from 'src/assets/icons/account.svg';
import Dashboard from 'src/assets/icons/dashboard.svg';
import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Domain from 'src/assets/icons/entityIcons/domain.svg';
import Firewall from 'src/assets/icons/entityIcons/firewall.svg';
import Image from 'src/assets/icons/entityIcons/image.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import StackScript from 'src/assets/icons/entityIcons/stackscript.svg';
import Volume from 'src/assets/icons/entityIcons/volume.svg';
import Longview from 'src/assets/icons/longview.svg';
import Managed from 'src/assets/icons/managednav.svg';
import Logo from 'src/assets/logo/new-logo.svg';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import ListItemText from 'src/components/core/ListItemText';
import Menu from 'src/components/core/Menu';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useDomains from 'src/hooks/useDomains';
import useFlags from 'src/hooks/useFlags';
import usePrefetch from 'src/hooks/usePreFetch';
import AdditionalMenuItems from './AdditionalMenuItems';
import usePrimaryNavStyles from './PrimaryNav_CMR.styles';
import SpacingToggle from './SpacingToggle';
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
  | 'StackScripts';

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
  toggleTheme: () => void;
  toggleSpacing: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav: React.FC<PrimaryNavProps> = props => {
  const { closeMenu, isCollapsed, toggleTheme, toggleSpacing } = props;
  const classes = usePrimaryNavStyles();

  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLElement) | undefined
  >();

  const flags = useFlags();
  const { domains, requestDomains } = useDomains();

  const {
    _hasAccountAccess,
    _isManagedAccount,
    account
  } = useAccountManagement();

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
            icon: <Dashboard className="small" />
          }
        ]
      },
      {
        group: 'Compute',
        links: [
          {
            display: 'Linodes',
            href: '/linodes',
            activeLinks: ['/linodes', '/linodes/create'],
            icon: <Linode />
          },
          {
            display: 'NodeBalancers',
            href: '/nodebalancers',
            icon: <NodeBalancer />
          },
          {
            display: 'Kubernetes',
            href: '/kubernetes/clusters',
            icon: <Kubernetes />
          },
          {
            display: 'StackScripts',
            href: '/stackscripts?type=account',
            icon: <StackScript />
          },
          {
            display: 'Images',
            href: '/images',
            icon: <Image className="small" />
          }
        ]
      },
      {
        group: 'Network',
        links: [
          {
            display: 'Domains',
            href: '/domains',
            icon: <Domain style={{ transform: 'scale(1.5)' }} />,
            prefetchRequestFn: requestDomains,
            prefetchRequestCondition:
              !domains.loading && domains.lastUpdated === 0
          },
          {
            display: 'Firewalls',
            href: '/firewalls',
            icon: <Firewall />,
            hide: !flags.firewalls
          }
        ]
      },
      {
        group: 'Storage',
        links: [
          {
            display: 'Volumes',
            href: '/volumes',
            icon: <Volume />
          },
          {
            display: 'Object Storage',
            href: '/object-storage/buckets',
            activeLinks: [
              '/object-storage/buckets',
              '/object-storage/access-keys'
            ],
            icon: <Storage />
          }
        ]
      },
      {
        group: 'Monitors',
        links: [
          {
            display: 'Longview',
            href: '/longview',
            icon: <Longview className="small" />
          },
          {
            display: 'Managed',
            href: '/managed',
            icon: <Managed />,
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
            attr: { 'data-qa-one-click-nav-btn': true },
            icon: <OCA />
          }
        ]
      },
      {
        group: 'None',
        links: [
          {
            display: 'Account',
            href: '/account/billing',
            icon: <Account className="small" />,
            activeLinks: [
              '/account/billing',
              '/account/users',
              '/account/settings'
            ],
            hide: account.lastUpdated === 0 || !_hasAccountAccess
          }
        ]
      }
    ],
    [
      flags.firewalls,
      _isManagedAccount,
      account.lastUpdated,
      _hasAccountAccess,
      domains.loading,
      domains.lastUpdated,
      requestDomains
    ]
  );

  return (
    <Grid
      className={classes.menuGrid}
      container
      alignItems="flex-start"
      justify="flex-start"
      direction="row"
      wrap="nowrap"
      spacing={0}
      component="nav"
      role="navigation"
    >
      <Grid item>
        <div
          className={classNames({
            [classes.logoItem]: true,
            [classes.logoCollapsed]: isCollapsed
          })}
        >
          <Link to={`/dashboard`} onClick={closeMenu} title="Dashboard">
            <Logo width={101} height={29} />
          </Link>
        </div>
      </Grid>
      <div
        className={classNames({
          ['fade-in-table']: true,
          [classes.fadeContainer]: true
        })}
      >
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
                href={link.href}
                display={link.display}
                closeMenu={closeMenu}
                isCollapsed={isCollapsed}
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

        {/** menu items under the main navigation links */}
        <AdditionalMenuItems
          linkClasses={() =>
            classNames({
              [classes.listItem]: true
            })
          }
          listItemClasses={classNames({
            [classes.linkItem]: true
          })}
          closeMenu={closeMenu}
          dividerClasses={classes.divider}
          isCollapsed={isCollapsed}
        />

        <Hidden mdUp>
          <Divider className={classes.divider} />
          <Link
            to="/profile/display"
            onClick={closeMenu}
            data-qa-nav-item="/profile/display"
            className={classes.listItem}
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
            to="/logout"
            onClick={closeMenu}
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
        <IconButton
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
          }}
          className={classNames({
            [classes.settings]: true,
            [classes.settingsCollapsed]: isCollapsed,
            [classes.activeSettings]: !!anchorEl
          })}
          aria-label="User settings"
        >
          <Settings />
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
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          className={classes.menu}
          BackdropProps={{
            className: classes.settingsBackdrop
          }}
        >
          <ThemeToggle toggleTheme={toggleTheme} />
          <SpacingToggle toggleSpacing={toggleSpacing} />
        </Menu>
      </div>
    </Grid>
  );
};

export default React.memo(PrimaryNav);

// =============================================================================
// NavGroup
// =============================================================================
interface NavGroupProps {
  group: NavGroup;
  links: PrimaryLink[];
}

export const NavGroup: React.FC<NavGroupProps> = props => {
  const { group, links } = props;

  const classes = usePrimaryNavStyles();

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
                href,
                display,
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
        as={Link}
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
  isCollapsed: boolean;
  prefetchRequestFn?: () => void;
  prefetchRequestCondition?: boolean;
}

const PrimaryNavLink: React.FC<PrimaryNavLink> = React.memo(props => {
  const classes = usePrimaryNavStyles();

  const { handlers } = usePrefetch(
    props.prefetchRequestFn,
    props.prefetchRequestCondition
  );

  const { isCollapsed, closeMenu, href, onClick, attr, icon, display } = props;

  return (
    <>
      <Link
        to={href}
        onClick={(e: React.ChangeEvent<any>) => {
          closeMenu();
          if (onClick) {
            onClick(e);
          }
        }}
        {...handlers}
        {...attr}
        className={classes.listItem}
      >
        {icon && isCollapsed && <div className="icon">{icon}</div>}
        <ListItemText
          primary={display}
          disableTypography={true}
          className={classNames({
            [classes.linkItem]: true,
            primaryNavLink: true
          })}
        />
      </Link>
      <Divider className={classes.divider} />
    </>
  );
});
