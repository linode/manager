import * as classNames from 'classnames';
import * as React from 'react';
import { Link, LinkProps, useLocation } from 'react-router-dom';
import Account from 'src/assets/icons/account.svg';
import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Domain from 'src/assets/icons/entityIcons/domain.svg';
import Firewall from 'src/assets/icons/entityIcons/firewall.svg';
import Image from 'src/assets/icons/entityIcons/image.svg';
import Kubernetes from 'src/assets/icons/entityIcons/kubernetes.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import Managed from 'src/assets/icons/entityIcons/managed.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import OCA from 'src/assets/icons/entityIcons/oneclick.svg';
import StackScript from 'src/assets/icons/entityIcons/stackscript.svg';
import Volume from 'src/assets/icons/entityIcons/volume.svg';
import HelpIcon from 'src/assets/icons/get_help.svg';
import Longview from 'src/assets/icons/longview.svg';
import Logo from 'src/assets/logo/logo.svg';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useDomains from 'src/hooks/useDomains';
import useFlags from 'src/hooks/useFlags';
import useObjectStorageBuckets from 'src/hooks/useObjectStorageBuckets';
import useObjectStorageClusters from 'src/hooks/useObjectStorageClusters';
import usePrefetch from 'src/hooks/usePreFetch';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import useStyles from './PrimaryNav.styles';
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
  | 'StackScripts'
  | 'Databases'
  | 'Account'
  | 'Help & Support';

interface PrimaryLink {
  display: NavEntity;
  href: string;
  attr?: { [key: string]: any };
  icon?: JSX.Element;
  activeLinks?: Array<string>;
  onClick?: (e: React.ChangeEvent<any>) => void;
  hide?: boolean;
  isBeta?: boolean;
  prefetchRequestFn?: () => void;
  prefetchRequestCondition?: boolean;
}

export interface Props {
  closeMenu: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav: React.FC<Props> = (props) => {
  const { closeMenu, isCollapsed } = props;
  const classes = useStyles();

  const flags = useFlags();
  const location = useLocation();
  const { domains, requestDomains } = useDomains();
  const {
    objectStorageClusters,
    requestObjectStorageClusters,
  } = useObjectStorageClusters();
  const {
    objectStorageBuckets,
    requestObjectStorageBuckets,
  } = useObjectStorageBuckets();

  const {
    _isManagedAccount,
    _isLargeAccount,
    _isRestrictedUser,
    account,
  } = useAccountManagement();

  const showFirewalls = isFeatureEnabled(
    'Cloud Firewall',
    Boolean(flags.firewalls),
    account?.data?.capabilities ?? []
  );

  // No account capability returned yet.
  const showDatabases = flags.databases;

  const clustersLoadedOrLoadingOrHasError =
    objectStorageClusters.lastUpdated > 0 ||
    objectStorageClusters.loading ||
    objectStorageClusters.error;

  React.useEffect(() => {
    if (!clustersLoadedOrLoadingOrHasError && !_isRestrictedUser) {
      requestObjectStorageClusters();
    }
  }, [
    _isRestrictedUser,
    clustersLoadedOrLoadingOrHasError,
    requestObjectStorageClusters,
  ]);

  const clusterIds = objectStorageClusters.entities.map(
    (thisCluster) => thisCluster.id
  );

  const primaryLinkGroups: PrimaryLink[][] = React.useMemo(
    () => [
      [
        {
          hide: !_isManagedAccount,
          display: 'Managed',
          href: '/managed',
          icon: <Managed />,
        },
      ],
      [
        {
          display: 'Linodes',
          href: '/linodes',
          activeLinks: ['/linodes', '/linodes/create'],
          icon: <Linode />,
        },
        {
          display: 'Volumes',
          href: '/volumes',
          icon: <Volume />,
        },
        {
          display: 'NodeBalancers',
          href: '/nodebalancers',
          icon: <NodeBalancer />,
        },

        {
          hide: !showFirewalls,
          display: 'Firewalls',
          href: '/firewalls',
          icon: <Firewall />,
          isBeta: true,
        },
        {
          display: 'StackScripts',
          href: '/stackscripts',
          icon: <StackScript />,
        },
        {
          display: 'Images',
          href: '/images',
          icon: <Image />,
        },
      ],
      [
        {
          display: 'Domains',
          href: '/domains',
          icon: <Domain />,
          prefetchRequestFn: requestDomains,
          prefetchRequestCondition:
            !domains.loading && domains.lastUpdated === 0 && !_isLargeAccount,
        },
        {
          display: 'Kubernetes',
          href: '/kubernetes/clusters',
          icon: <Kubernetes />,
        },
        {
          hide: !showDatabases,
          display: 'Databases',
          href: '/databases',
          icon: <Database />,
        },
        {
          display: 'Object Storage',
          href: '/object-storage/buckets',
          activeLinks: [
            '/object-storage/buckets',
            '/object-storage/access-keys',
          ],
          icon: <Storage />,
          prefetchRequestFn: () => requestObjectStorageBuckets(clusterIds),
          prefetchRequestCondition:
            !objectStorageBuckets.loading &&
            objectStorageBuckets.lastUpdated === 0,
        },
        {
          display: 'Longview',
          href: '/longview',
          icon: <Longview />,
        },
        {
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
          attr: { 'data-qa-one-click-nav-btn': true },
          icon: <OCA />,
        },
      ],
      [
        {
          display: 'Account',
          href: '/account',
          icon: <Account />,
        },
        {
          display: 'Help & Support',
          href: '/support',
          icon: <HelpIcon />,
        },
      ],
    ],
    [
      showFirewalls,
      showDatabases,
      _isManagedAccount,
      domains.loading,
      domains.lastUpdated,
      requestDomains,
      _isLargeAccount,
      objectStorageBuckets.loading,
      objectStorageBuckets.lastUpdated,
      requestObjectStorageBuckets,
      clusterIds,
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
        <div className={classes.logoItem}>
          {isCollapsed && (
            <span className={`${classes.logoCollapsed} logoCollapsed`}></span>
          )}
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
          [classes.fadeContainer]: true,
        })}
      >
        {primaryLinkGroups.map((thisGroup, idx) => {
          const filteredLinks = thisGroup.filter((thisLink) => !thisLink.hide);
          if (filteredLinks.length === 0) {
            return null;
          }
          return (
            <div key={idx}>
              <Divider className={classes.divider} />
              {filteredLinks.map((thisLink) => {
                const props = {
                  key: thisLink.display,
                  closeMenu,
                  isCollapsed,
                  locationSearch: location.search,
                  locationPathname: location.pathname,
                  ...thisLink,
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
      </div>
    </Grid>
  );
};

export default React.memo(PrimaryNav);

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isBeta?: boolean;
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

const PrimaryLink: React.FC<PrimaryLinkProps> = React.memo((props) => {
  const classes = useStyles();

  const {
    isBeta,
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
    prefetchProps,
  } = props;

  return (
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
      })}
      data-testid={`menu-item-${display}`}
    >
      {icon && (
        <div className="icon" aria-hidden>
          {icon}
        </div>
      )}
      <p
        className={classNames({
          [classes.linkItem]: true,
          primaryNavLink: true,
          hiddenWhenCollapsed: isCollapsed,
        })}
      >
        {display}
        {isBeta ? (
          <Chip className={classes.chip} label="beta" component="span" />
        ) : null}
      </p>
    </Link>
  );
});

interface PrefetchPrimaryLinkProps {
  prefetchRequestFn: () => void;
  prefetchRequestCondition: boolean;
}

// Wrapper around PrimaryLink that includes the usePrefetchHook.
export const PrefetchPrimaryLink: React.FC<
  PrimaryLinkProps & PrefetchPrimaryLinkProps
> = React.memo((props) => {
  const { makeRequest, cancelRequest } = usePrefetch(
    props.prefetchRequestFn,
    props.prefetchRequestCondition
  );

  const prefetchProps: PrimaryLinkProps['prefetchProps'] = {
    onMouseEnter: makeRequest,
    onFocus: makeRequest,
    onMouseLeave: cancelRequest,
    onBlur: cancelRequest,
  };

  return <PrimaryLink {...props} prefetchProps={prefetchProps} />;
});
