import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Settings from '@material-ui/icons/Settings';
import {
  Menu as ReachMenu,
  MenuButton,
  MenuLink,
  MenuItems,
  MenuList,
  MenuPopover
} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import * as classNames from 'classnames';
import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';
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
import { sendOneClickNavigationEvent } from 'src/utilities/ga';
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
  | 'Community';

interface PrimaryLink {
  display: NavEntity;
  href: string;
  group?: NavGroup;
  attr?: { [key: string]: any };
  icon?: JSX.Element;
  activeLinks?: Array<string>;
  onClick?: (e: React.ChangeEvent<any>) => void;
  hide?: boolean;
  prefetchRequestFn?: () => void;
  prefetchRequestCondition?: boolean;
}

export interface Props {
  closeMenu: () => void;
  toggleTheme: () => void;
  toggleSpacing: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav: React.FC<Props> = props => {
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

  const primaryLinkGroups: PrimaryLink[][] = React.useMemo(
    () => [
      [
        {
          display: 'Dashboard',
          href: '/dashboard',
          icon: <Dashboard className="small" />
        }
      ],
      [
        {
          group: 'Compute',
          display: 'Linodes',
          href: '/linodes',
          activeLinks: ['/linodes', '/linodes/create'],
          icon: <Linode />
        },
        {
          group: 'Compute',
          display: 'NodeBalancers',
          href: '/nodebalancers',
          icon: <NodeBalancer />
        },
        {
          group: 'Compute',
          display: 'Kubernetes',
          href: '/kubernetes/clusters',
          icon: <Kubernetes />
        },
        {
          group: 'Compute',
          display: 'StackScripts',
          href: '/stackscripts?type=account',
          icon: <StackScript />
        },
        {
          group: 'Compute',
          display: 'Images',
          href: '/images',
          icon: <Image className="small" />
        }
      ],
      [
        {
          group: 'Network',
          display: 'Domains',
          href: '/domains',
          icon: <Domain style={{ transform: 'scale(1.5)' }} />,
          prefetchRequestFn: requestDomains,
          prefetchRequestCondition:
            !domains.loading && domains.lastUpdated === 0
        },
        {
          group: 'Network',
          display: 'Firewalls',
          href: '/firewalls',
          icon: <Firewall />,
          hide: !flags.firewalls
        }
      ],
      [
        {
          group: 'Storage',
          display: 'Volumes',
          href: '/volumes',
          icon: <Volume />
        },
        {
          group: 'Storage',
          display: 'Object Storage',
          href: '/object-storage/buckets',
          activeLinks: [
            '/object-storage/buckets',
            '/object-storage/access-keys'
          ],
          icon: <Storage />
        }
      ],
      [
        {
          group: 'Monitors',
          display: 'Longview',
          href: '/longview',
          icon: <Longview className="small" />
        },
        {
          group: 'Monitors',
          display: 'Managed',
          href: '/managed',
          icon: <Managed />,
          hide: !_isManagedAccount
        }
      ],
      [
        {
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
          attr: { 'data-qa-one-click-nav-btn': true },
          icon: <OCA />,
          onClick: () => {
            sendOneClickNavigationEvent('Primary Nav');
          }
        }
      ],
      [
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

  // const filteredLinks = primaryLinks.filter(thisLink => !thisLink.hide);

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
        {primaryLinkGroups.map(thisPrimaryLinkGroup => {
          if (thisPrimaryLinkGroup.length === 1) {
            const link = thisPrimaryLinkGroup[0];

            const props = {
              key: link.display,
              closeMenu,
              isCollapsed,
              ...link
            };

            return link.prefetchRequestFn &&
              link.prefetchRequestCondition !== undefined ? (
              <PrefetchPrimaryLink
                {...props}
                prefetchRequestFn={link.prefetchRequestFn}
                prefetchRequestCondition={link.prefetchRequestCondition}
              />
            ) : (
              <PrimaryLink {...props} />
            );
          }

          return (
            <NavGroup
              key={thisPrimaryLinkGroup[0].group}
              group={thisPrimaryLinkGroup[0].group!}
              links={thisPrimaryLinkGroup}
            />
          );
        })}
        {/* {filteredLinks.map(thisLink => {


          // PrefetchPrimaryLink and PrimaryLink are two separate components because invocation of
          // hooks cannot be conditional. <PrefetchPrimaryLink /> is a wrapper around <PrimaryLink />
          // that includes the usePrefetch hook.
          return thisLink.prefetchRequestFn &&
            thisLink.prefetchRequestCondition !== undefined ? (
            <PrefetchPrimaryLink
              {...props}
              prefetchRequestFn={thisLink.prefetchRequestFn}
              prefetchRequestCondition={thisLink.prefetchRequestCondition}
            />
          ) : (
            <PrimaryLink {...props} />
          );
        })} */}

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

interface NavGroupProps {
  group: NavGroup;
  links: PrimaryLink[];
}

export const NavGroup: React.FC<NavGroupProps> = props => {
  const { group, links } = props;

  const classes = usePrimaryNavStyles();

  const filteredLinks = links.filter(thisLink => thisLink.group === group);

  return (
    <div className={classes.menuWrapper}>
      <ReachMenu>
        <MenuButton className={`${classes.menuButton} ${classes.linkItem}`}>
          {group}
          <KeyboardArrowDown className={classes.caret} />
        </MenuButton>
        <MenuPopover className={classes.menuPopover} portal={false}>
          {/* <MenuItems className={classes.menuItemList}> */}
          <MenuItems>
            {filteredLinks.map(thisFilteredLink => {
              return (
                <MenuLink
                  as="a"
                  key={thisFilteredLink.display}
                  href={thisFilteredLink.href}
                  // className={`${classes.menuItemLink} ${classes.linkItem}`}
                >
                  {thisFilteredLink.display}
                </MenuLink>
              );
            })}
          </MenuItems>
        </MenuPopover>
      </ReachMenu>
    </div>
  );
};

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isCollapsed: boolean;
  prefetchProps?: {
    onMouseEnter: LinkProps['onMouseEnter'];
    onMouseLeave: LinkProps['onMouseLeave'];
    onFocus: LinkProps['onFocus'];
    onBlur: LinkProps['onBlur'];
  };
}

const PrimaryLink: React.FC<PrimaryLinkProps> = React.memo(props => {
  const classes = usePrimaryNavStyles();

  const {
    isCollapsed,
    closeMenu,
    href,
    onClick,
    attr,
    icon,
    display,
    prefetchProps
  } = props;

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
        {...prefetchProps}
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

interface PrefetchPrimaryLinkProps {
  prefetchRequestFn: () => void;
  prefetchRequestCondition: boolean;
}

// Wrapper around PrimaryLink that includes the usePrefetchHook.
export const PrefetchPrimaryLink: React.FC<PrimaryLinkProps &
  PrefetchPrimaryLinkProps> = React.memo(props => {
  const { makeRequest, cancelRequest } = usePrefetch(
    props.prefetchRequestFn,
    props.prefetchRequestCondition
  );

  const prefetchProps: PrimaryLinkProps['prefetchProps'] = {
    onMouseEnter: makeRequest,
    onFocus: makeRequest,
    onMouseLeave: cancelRequest,
    onBlur: cancelRequest
  };

  return <PrimaryLink {...props} prefetchProps={prefetchProps} />;
});
