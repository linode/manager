import Settings from '@material-ui/icons/Settings';
import * as classNames from 'classnames';
import * as React from 'react';
import { Link, useLocation, LinkProps } from 'react-router-dom';
import Kubernetes from 'src/assets/addnewmenu/kubernetes.svg';
import OCA from 'src/assets/addnewmenu/oneclick.svg';
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
import useFlags from 'src/hooks/useFlags';
import usePrefetch from 'src/hooks/usePreFetch';
import useStyles from './PrimaryNav_CMR.styles';
import ThemeToggle from './ThemeToggle';
import { linkIsActive } from './utils';
import useDomains from 'src/hooks/useDomains';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

type NavEntity =
  | 'Linodes'
  | 'Volumes'
  | 'VLANS'
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

export interface Props {
  closeMenu: () => void;
  toggleTheme: () => void;
  toggleSpacing: () => void; // to keep props same for non-cmr
  isCollapsed: boolean;
}

export const PrimaryNav: React.FC<Props> = props => {
  const { closeMenu, isCollapsed, toggleTheme } = props;
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLElement) | undefined
  >();

  const flags = useFlags();
  const location = useLocation();
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

  const primaryLinkGroups: PrimaryLink[][] = React.useMemo(
    () => [
      [
        {
          hide: !_isManagedAccount,
          display: 'Managed',
          href: '/managed',
          icon: <Managed />
        }
      ],
      [
        {
          display: 'Linodes',
          href: '/linodes',
          activeLinks: ['/linodes', '/linodes/create'],
          icon: <Linode />
        },
        {
          display: 'Volumes',
          href: '/volumes',
          icon: <Volume />
        },
        {
          display: 'VLANS',
          href: '/vlans',
          icon: <Linode />
        },
        {
          display: 'NodeBalancers',
          href: '/nodebalancers',
          icon: <NodeBalancer />
        },

        {
          hide: !showFirewalls,
          display: 'Firewalls',
          href: '/firewalls',
          icon: <Firewall />
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
      ],
      [
        {
          display: 'Domains',
          href: '/domains',
          icon: <Domain style={{ transform: 'scale(1.5)' }} />,
          prefetchRequestFn: requestDomains,
          prefetchRequestCondition:
            !domains.loading && domains.lastUpdated === 0 && !_isLargeAccount
        },
        {
          display: 'Kubernetes',
          href: '/kubernetes/clusters',
          icon: <Kubernetes />
        },
        {
          display: 'Object Storage',
          href: '/object-storage/buckets',
          activeLinks: [
            '/object-storage/buckets',
            '/object-storage/access-keys'
          ],
          icon: <Storage />
        },
        {
          display: 'Longview',
          href: '/longview',
          icon: <Longview className="small" />
        },
        {
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
          attr: { 'data-qa-one-click-nav-btn': true },
          icon: <OCA />
        }
      ]
    ],
    [
      showFirewalls,
      _isManagedAccount,
      domains.loading,
      domains.lastUpdated,
      requestDomains,
      _isLargeAccount
    ]
  );

  return (
    <Grid
      className={classes.menuGrid}
      container
      alignItems="flex-start"
      justify="flex-start"
      direction="column"
      wrap="nowrap"
      spacing={0}
      component="nav"
      role="navigation"
      id="main-navigation"
    >
      <Grid item>
        <div
          className={classNames({
            [classes.logoItem]: true,
            [classes.logoCollapsed]: isCollapsed
          })}
        >
          <Link
            to={`/dashboard`}
            onClick={closeMenu}
            aria-label="Dashboard"
            title="Dashboard"
          >
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
        {primaryLinkGroups.map((thisGroup, idx) => {
          const filteredLinks = thisGroup.filter(thisLink => !thisLink.hide);
          if (filteredLinks.length === 0) {
            return null;
          }
          return (
            <div key={idx} className={classes.linkGroup}>
              {filteredLinks.map(thisLink => {
                const props = {
                  key: thisLink.display,
                  closeMenu,
                  isCollapsed,
                  locationSearch: location.search,
                  locationPathname: location.pathname,
                  ...thisLink
                };

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
              })}
            </div>
          );
        })}

        <Hidden mdUp>
          <Divider className={classes.divider} />
          <Link
            to="/account"
            onClick={closeMenu}
            data-qa-nav-item="/account"
            className={classNames({
              [classes.listItem]: true,
              [classes.active]:
                linkIsActive('/account', location.search, location.pathname) ===
                true
            })}
          >
            <ListItemText
              primary="Account"
              disableTypography={true}
              className={classNames({
                [classes.linkItem]: true
              })}
            />
          </Link>
          <Link
            to="/profile/display"
            onClick={closeMenu}
            data-qa-nav-item="/profile/display"
            className={classNames({
              [classes.listItem]: true,
              [classes.active]:
                linkIsActive(
                  '/profile/display',
                  location.search,
                  location.pathname
                ) === true
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
        <div className={classes.spacer} />
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
        </Menu>
      </div>
    </Grid>
  );
};

export default React.memo(PrimaryNav);

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isCollapsed: boolean;
  locationSearch: string;
  locationPathname: string;
  prefetchProps?: {
    onMouseEnter: LinkProps['onMouseEnter'];
    onMouseLeave: LinkProps['onMouseLeave'];
    onFocus: LinkProps['onFocus'];
    onBlur: LinkProps['onBlur'];
  };
}

const PrimaryLink: React.FC<PrimaryLinkProps> = React.memo(props => {
  const classes = useStyles();

  const {
    isCollapsed,
    closeMenu,
    href,
    onClick,
    attr,
    activeLinks,
    icon,
    display,
    locationSearch,
    locationPathname,
    prefetchProps
  } = props;

  return (
    <>
      <Divider className={classes.divider} />
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
        className={classNames({
          [classes.listItem]: true,
          [classes.active]: linkIsActive(
            href,
            locationSearch,
            locationPathname,
            activeLinks
          ),
          listItemCollapsed: isCollapsed
        })}
        data-testid={`menu-item-${display}`}
      >
        {icon && isCollapsed && (
          <div className="icon" aria-hidden>
            {icon}
          </div>
        )}
        <p
          className={classNames({
            [classes.linkItem]: true,
            primaryNavLink: true,
            hiddenWhenCollapsed: isCollapsed
          })}
        >
          {display}
        </p>
      </Link>
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
