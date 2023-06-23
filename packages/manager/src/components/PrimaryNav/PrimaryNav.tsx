import Grid from '@mui/material/Unstable_Grid2';
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
import TooltipIcon from 'src/assets/icons/get_help.svg';
import Longview from 'src/assets/icons/longview.svg';
import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import Divider from 'src/components/core/Divider';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import usePrefetch from 'src/hooks/usePreFetch';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { useStackScriptsOCA } from 'src/queries/stackscripts';
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

export const PrimaryNav = (props: Props) => {
  const { closeMenu, isCollapsed } = props;
  const { classes, cx } = useStyles();

  const flags = useFlags();
  const location = useLocation();

  const [enableObjectPrefetch, setEnableObjectPrefetch] = React.useState(false);

  const [
    enableMarketplacePrefetch,
    setEnableMarketplacePrefetch,
  ] = React.useState(false);

  const { _isManagedAccount, account } = useAccountManagement();

  const {
    data: oneClickApps,
    error: oneClickAppsError,
    isLoading: oneClickAppsLoading,
  } = useStackScriptsOCA(enableMarketplacePrefetch);

  const {
    data: clusters,
    error: clustersError,
    isLoading: clustersLoading,
  } = useObjectStorageClusters(enableObjectPrefetch);

  const {
    data: buckets,
    error: bucketsError,
    isLoading: bucketsLoading,
  } = useObjectStorageBuckets(clusters, enableObjectPrefetch);

  const allowObjPrefetch =
    !buckets &&
    !clusters &&
    !clustersLoading &&
    !bucketsLoading &&
    !clustersError &&
    !bucketsError;

  const allowMarketplacePrefetch =
    !oneClickApps && !oneClickAppsLoading && !oneClickAppsError;

  const showDatabases = isFeatureEnabled(
    'Managed Databases',
    Boolean(flags.databases),
    account?.capabilities ?? []
  );

  const prefetchObjectStorage = () => {
    if (!enableObjectPrefetch) {
      setEnableObjectPrefetch(true);
    }
  };

  const prefetchMarketplace = () => {
    if (!enableMarketplacePrefetch) {
      setEnableMarketplacePrefetch(true);
    }
  };

  const primaryLinkGroups: PrimaryLink[][] = React.useMemo(
    () => [
      [
        {
          display: 'Managed',
          hide: !_isManagedAccount,
          href: '/managed',
          icon: <Managed />,
        },
      ],
      [
        {
          activeLinks: ['/linodes', '/linodes/create'],
          display: 'Linodes',
          href: '/linodes',
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
          display: 'Firewalls',
          href: '/firewalls',
          icon: <Firewall />,
        },
        {
          display: 'StackScripts',
          href: '/stackscripts',
          icon: <StackScript />,
        },
        {
          activeLinks: [
            '/images/create/create-image',
            '/images/create/upload-image',
          ],
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
        },
        {
          display: 'Databases',
          hide: !showDatabases,
          href: '/databases',
          icon: <Database />,
          isBeta: flags.databaseBeta,
        },
        {
          activeLinks: ['/kubernetes/create'],
          display: 'Kubernetes',
          href: '/kubernetes/clusters',
          icon: <Kubernetes />,
        },
        {
          activeLinks: [
            '/object-storage/buckets',
            '/object-storage/access-keys',
          ],
          display: 'Object Storage',
          href: '/object-storage/buckets',
          icon: <Storage />,
          prefetchRequestCondition: allowObjPrefetch,
          prefetchRequestFn: prefetchObjectStorage,
        },
        {
          display: 'Longview',
          href: '/longview',
          icon: <Longview />,
        },
        {
          attr: { 'data-qa-one-click-nav-btn': true },
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
          icon: <OCA />,
          prefetchRequestCondition: allowMarketplacePrefetch,
          prefetchRequestFn: prefetchMarketplace,
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
          icon: <TooltipIcon status="help" />,
        },
      ],
    ],
    [
      showDatabases,
      _isManagedAccount,
      allowObjPrefetch,
      allowMarketplacePrefetch,
      flags.databaseBeta,
    ]
  );

  return (
    <Grid
      className={classes.menuGrid}
      container
      alignItems="flex-start"
      justifyContent="flex-start"
      direction="column"
      wrap="nowrap"
      spacing={0}
      component="nav"
      role="navigation"
      id="main-navigation"
    >
      <Grid>
        <div
          className={cx(classes.logoItemAkamai, {
            [classes.logoItemAkamaiCollapsed]: isCollapsed,
          })}
        >
          <Link
            to={`/dashboard`}
            onClick={closeMenu}
            aria-label="Akamai - Dashboard"
            title="Akamai - Dashboard"
            className={cx({
              [classes.logoContainer]: isCollapsed,
            })}
          >
            <AkamaiLogo
              width={128}
              className={cx(
                {
                  [classes.logoAkamaiCollapsed]: isCollapsed,
                },
                classes.logo
              )}
            />
          </Link>
        </div>
      </Grid>
      <div
        className={cx({
          [classes.fadeContainer]: true,
          ['fade-in-table']: true,
        })}
      >
        {primaryLinkGroups.map((thisGroup, idx) => {
          const filteredLinks = thisGroup.filter((thisLink) => !thisLink.hide);
          if (filteredLinks.length === 0) {
            return null;
          }
          return (
            <div key={idx}>
              <Divider
                className={classes.divider}
                spacingTop={12}
                spacingBottom={12}
              />
              {filteredLinks.map((thisLink) => {
                const props = {
                  closeMenu,
                  isCollapsed,
                  key: thisLink.display,
                  locationPathname: location.pathname,
                  locationSearch: location.search,
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

const PrimaryLink = React.memo((props: PrimaryLinkProps) => {
  const { classes, cx } = useStyles();

  const {
    activeLinks,
    attr,
    closeMenu,
    display,
    href,
    icon,
    isBeta,
    isCollapsed,
    locationPathname,
    locationSearch,
    onClick,
    prefetchProps,
  } = props;

  const isActiveLink = Boolean(
    linkIsActive(href, locationSearch, locationPathname, activeLinks)
  );

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
      className={cx({
        [classes.active]: isActiveLink,
        [classes.listItem]: true,
      })}
      aria-current={isActiveLink}
      data-testid={`menu-item-${display}`}
    >
      {icon && (
        <div className="icon" aria-hidden>
          {icon}
        </div>
      )}
      <p
        className={cx({
          [classes.linkItem]: true,
          hiddenWhenCollapsed: isCollapsed,
          primaryNavLink: true,
        })}
      >
        {display}
        {isBeta ? (
          <BetaChip className={classes.chip} color="primary" component="span" />
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
export const PrefetchPrimaryLink = React.memo(
  (props: PrimaryLinkProps & PrefetchPrimaryLinkProps) => {
    const { cancelRequest, makeRequest } = usePrefetch(
      props.prefetchRequestFn,
      props.prefetchRequestCondition
    );

    const prefetchProps: PrimaryLinkProps['prefetchProps'] = {
      onBlur: cancelRequest,
      onFocus: makeRequest,
      onMouseEnter: makeRequest,
      onMouseLeave: cancelRequest,
    };

    return <PrimaryLink {...props} prefetchProps={prefetchProps} />;
  }
);
