import Settings from '@material-ui/icons/Settings';
import * as classNames from 'classnames';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import usePreFetch, { PreFetchEntity } from 'src/hooks/usePreFetch';
import { sendOneClickNavigationEvent } from 'src/utilities/ga';
import AdditionalMenuItems from './AdditionalMenuItems';
import useStyles from './PrimaryNav.styles';
import SpacingToggle from './SpacingToggle';
import ThemeToggle from './ThemeToggle';
import { linkIsActive } from './utils';

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
  entitiesToPreFetch?: PreFetchEntity[];
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
  const location = useLocation();
  const preFetch = usePreFetch();

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
        entitiesToPreFetch: ['domains']
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
        display: 'Kubernetes',
        href: '/kubernetes/clusters',
        icon: <Kubernetes />
      },
      {
        hide: !_isManagedAccount,
        display: 'Managed',
        href: '/managed',
        icon: <Managed />
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
      },
      {
        hide: account.lastUpdated === 0 || !_hasAccountAccess,
        display: 'Account',
        href: '/account/billing',
        icon: <Account className="small" />,
        activeLinks: ['/account/billing', '/account/users', '/account/settings']
      }
    ],
    [flags.firewalls, _isManagedAccount, account.lastUpdated, _hasAccountAccess]
  );

  const filteredLinks = primaryLinks.filter(thisLink => !thisLink.hide);

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
    >
      <Grid item>
        <div
          className={classNames({
            [classes.logoItem]: true,
            [classes.logoCollapsed]: isCollapsed
          })}
        >
          <Link to={`/dashboard`} onClick={closeMenu} title="Dashboard">
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
        {filteredLinks.map(thisLink => (
          <PrimaryLink
            key={thisLink.display}
            closeMenu={closeMenu}
            isCollapsed={isCollapsed}
            locationSearch={location.search}
            locationPathname={location.pathname}
            preFetch={preFetch}
            {...thisLink}
          />
        ))}

        {/** menu items under the main navigation links */}
        <AdditionalMenuItems
          linkClasses={(href?: string) =>
            classNames({
              [classes.listItem]: true,
              [classes.active]: href
                ? linkIsActive(href, location.search, location.pathname)
                : false
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
  locationSearch: string;
  locationPathname: string;
  preFetch: ReturnType<typeof usePreFetch>;
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
    preFetch,
    entitiesToPreFetch
  } = props;

  const doPreFetch = React.useCallback(() => {
    if (entitiesToPreFetch) {
      preFetch(entitiesToPreFetch);
    }
  }, [preFetch, entitiesToPreFetch]);

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
        onMouseEnter={doPreFetch}
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
