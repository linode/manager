import Settings from '@material-ui/icons/Settings';
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
import useFlags from 'src/hooks/useFlags';
import usePrefetch from 'src/hooks/usePreFetch';
import { sendOneClickNavigationEvent } from 'src/utilities/ga';
import AdditionalMenuItems from './AdditionalMenuItems';
import useStyles from './PrimaryNav_CMR.styles';
import SpacingToggle from './SpacingToggle';
import ThemeToggle from './ThemeToggle';
import useDomains from 'src/hooks/useDomains';

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
  toggleSpacing: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav: React.FC<Props> = props => {
  const { closeMenu, isCollapsed, toggleTheme, toggleSpacing } = props;
  const classes = useStyles();

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

  const primaryLinks: PrimaryLink[] = React.useMemo(
    () => [
      {
        display: 'Dashboard',
        href: '/dashboard',
        icon: <Dashboard className="small" />
      },
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
        display: 'Object Storage',
        href: '/object-storage/buckets',
        activeLinks: ['/object-storage/buckets', '/object-storage/access-keys'],
        icon: <Storage />
      },
      {
        display: 'NodeBalancers',
        href: '/nodebalancers',
        icon: <NodeBalancer />
      },
      {
        display: 'Domains',
        href: '/domains',
        icon: <Domain style={{ transform: 'scale(1.5)' }} />,
        prefetchRequestFn: requestDomains,
        prefetchRequestCondition: !domains.loading && domains.lastUpdated === 0
      },

      {
        hide: !flags.firewalls,
        display: 'Firewalls',
        href: '/firewalls',
        icon: <Firewall />
      },
      {
        display: 'Marketplace',
        href: '/linodes/create?type=One-Click',
        attr: { 'data-qa-one-click-nav-btn': true },
        icon: <OCA />,
        onClick: () => {
          sendOneClickNavigationEvent('Primary Nav');
        }
      },
      {
        display: 'Longview',
        href: '/longview',
        icon: <Longview className="small" />
      },
      {
        hide: true,
        display: 'Kubernetes',
        href: '/kubernetes/clusters',
        icon: <Kubernetes />
      },
      {
        hide: true,
        // hide: !_isManagedAccount,
        display: 'Managed',
        href: '/managed',
        icon: <Managed />
      },
      {
        hide: true,
        display: 'StackScripts',
        href: '/stackscripts?type=account',
        icon: <StackScript />
      },
      {
        hide: true,
        display: 'Images',
        href: '/images',
        icon: <Image className="small" />
      },
      {
        hide: true,
        // hide: account.lastUpdated === 0 || !_hasAccountAccess,
        display: 'Account',
        href: '/account/billing',
        icon: <Account className="small" />,
        activeLinks: ['/account/billing', '/account/users', '/account/settings']
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

  const filteredLinks = primaryLinks.filter(thisLink => !thisLink.hide);

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
        {filteredLinks.map(thisLink => {
          const props = {
            key: thisLink.display,
            closeMenu,
            isCollapsed,
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
  const classes = useStyles();

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
            primaryNavLink: true,
            hiddenWhenCollapsed: isCollapsed
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
