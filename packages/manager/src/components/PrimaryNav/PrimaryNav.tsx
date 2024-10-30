import { BetaChip, Box } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

import Account from 'src/assets/icons/account.svg';
import Beta from 'src/assets/icons/entityIcons/beta.svg';
import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Domain from 'src/assets/icons/entityIcons/domain.svg';
import Firewall from 'src/assets/icons/entityIcons/firewall.svg';
import Image from 'src/assets/icons/entityIcons/image.svg';
import Kubernetes from 'src/assets/icons/entityIcons/kubernetes.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import Managed from 'src/assets/icons/entityIcons/managed.svg';
import CloudPulse from 'src/assets/icons/entityIcons/monitor.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import OCA from 'src/assets/icons/entityIcons/oneclick.svg';
import PlacementGroups from 'src/assets/icons/entityIcons/placement-groups.svg';
import StackScript from 'src/assets/icons/entityIcons/stackscript.svg';
import Volume from 'src/assets/icons/entityIcons/volume.svg';
import VPC from 'src/assets/icons/entityIcons/vpc.svg';
import TooltipIcon from 'src/assets/icons/get_help.svg';
import Longview from 'src/assets/icons/longview.svg';
import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { Divider } from 'src/components/Divider';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { useFlags } from 'src/hooks/useFlags';
import { usePrefetch } from 'src/hooks/usePreFetch';
import { useAccountSettings } from 'src/queries/account/settings';

import useStyles from './PrimaryNav.styles';
import { linkIsActive } from './utils';

import type { LinkProps } from 'react-router-dom';

type NavEntity =
  | 'Account'
  | 'Account'
  | 'Betas'
  | 'Cloud Load Balancers'
  | 'Dashboard'
  | 'Databases'
  | 'Domains'
  | 'Firewalls'
  | 'Help & Support'
  | 'Images'
  | 'Kubernetes'
  | 'Linodes'
  | 'Longview'
  | 'Managed'
  | 'Marketplace'
  | 'Monitor'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Groups'
  | 'StackScripts'
  | 'VPC'
  | 'Volumes';

interface PrimaryLink {
  activeLinks?: Array<string>;
  attr?: { [key: string]: any };
  betaChipClassName?: string;
  display: NavEntity;
  hide?: boolean;
  href: string;
  icon?: JSX.Element;
  isBeta?: boolean;
  onClick?: (e: React.ChangeEvent<any>) => void;
  prefetchRequestCondition?: boolean;
  prefetchRequestFn?: () => void;
}

export interface PrimaryNavProps {
  closeMenu: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav = (props: PrimaryNavProps) => {
  const { closeMenu, isCollapsed } = props;
  const { classes, cx } = useStyles();

  const flags = useFlags();
  const location = useLocation();

  const { data: accountSettings } = useAccountSettings();
  const isManaged = accountSettings?.managed ?? false;

  const { isACLPEnabled } = useIsACLPEnabled();

  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isDatabasesEnabled, isDatabasesV2Beta } = useIsDatabasesEnabled();

  const primaryLinkGroups: PrimaryLink[][] = React.useMemo(
    () => [
      [
        {
          display: 'Managed',
          hide: !isManaged,
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
          display: 'VPC',
          href: '/vpcs',
          icon: <VPC />,
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
        {
          betaChipClassName: 'beta-chip-placement-groups',
          display: 'Placement Groups',
          hide: !isPlacementGroupsEnabled,
          href: '/placement-groups',
          icon: <PlacementGroups />,
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
          hide: !isDatabasesEnabled,
          href: '/databases',
          icon: <Database />,
          isBeta: isDatabasesV2Beta,
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
        },
        {
          display: 'Longview',
          href: '/longview',
          icon: <Longview />,
        },
        {
          display: 'Monitor',
          hide: !isACLPEnabled,
          href: '/monitor/cloudpulse',
          icon: <CloudPulse />,
          isBeta: flags.aclp?.beta,
        },
        {
          attr: { 'data-qa-one-click-nav-btn': true },
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
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
          display: 'Betas',
          hide: !flags.selfServeBetas,
          href: '/betas',
          icon: <Beta />,
        },
        {
          display: 'Help & Support',
          href: '/support',
          icon: <TooltipIcon status="help" />,
        },
      ],
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isDatabasesEnabled,
      isDatabasesV2Beta,
      isManaged,
      isPlacementGroupsEnabled,
      isACLPEnabled,
    ]
  );

  return (
    <Grid
      alignItems="flex-start"
      className={classes.menuGrid}
      component="nav"
      container
      direction="column"
      id="main-navigation"
      justifyContent="flex-start"
      role="navigation"
      spacing={0}
      wrap="nowrap"
    >
      <Grid sx={{ width: '100%' }}>
        <Box
          className={cx(classes.logoItemAkamai, {
            [classes.logoItemAkamaiCollapsed]: isCollapsed,
          })}
        >
          <Link
            className={cx({
              [classes.logoContainer]: isCollapsed,
              [classes.navLinkItem]: !isCollapsed,
            })}
            aria-label="Akamai - Dashboard"
            onClick={closeMenu}
            title="Akamai - Dashboard"
            to={`/dashboard`}
          >
            <AkamaiLogo
              className={cx(
                {
                  [classes.logoAkamaiCollapsed]: isCollapsed,
                },
                classes.logo
              )}
              width={83}
            />
          </Link>
        </Box>
      </Grid>

      {primaryLinkGroups.map((thisGroup, idx) => {
        const filteredLinks = thisGroup.filter((thisLink) => !thisLink.hide);
        if (filteredLinks.length === 0) {
          return null;
        }
        return (
          <div key={idx}>
            <Divider
              sx={(theme) => ({
                borderColor:
                  theme.name === 'light'
                    ? theme.borderColors.dividerDark
                    : 'rgba(0, 0, 0, 0.19)',
              })}
              className={classes.divider}
              spacingBottom={11}
              spacingTop={isManaged ? (idx === 0 ? 0 : 11) : idx === 1 ? 0 : 11}
            />
            {filteredLinks.map((thisLink) => {
              const props = {
                closeMenu,
                isCollapsed,
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
                  key={thisLink.display}
                  prefetchRequestCondition={thisLink.prefetchRequestCondition}
                  prefetchRequestFn={thisLink.prefetchRequestFn}
                />
              ) : (
                <PrimaryLink {...props} key={thisLink.display} />
              );
            })}
          </div>
        );
      })}
    </Grid>
  );
};

export default React.memo(PrimaryNav);

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isBeta?: boolean;
  isCollapsed: boolean;
  locationPathname: string;
  locationSearch: string;
  prefetchProps?: {
    onBlur: LinkProps['onBlur'];
    onFocus: LinkProps['onFocus'];
    onMouseEnter: LinkProps['onMouseEnter'];
    onMouseLeave: LinkProps['onMouseLeave'];
  };
}

const PrimaryLink = React.memo((props: PrimaryLinkProps) => {
  const { classes, cx } = useStyles();

  const {
    activeLinks,
    attr,
    betaChipClassName,
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
      onClick={(e: React.ChangeEvent<any>) => {
        closeMenu();
        if (onClick) {
          onClick(e);
        }
      }}
      to={href}
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
        <div aria-hidden className="icon">
          {icon}
        </div>
      )}
      <Box
        className={cx({
          [classes.linkItem]: true,
          hiddenWhenCollapsed: isCollapsed,
          primaryNavLink: true,
        })}
        sx={{
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {display}
        {isBeta ? (
          <BetaChip
            className={cx(betaChipClassName ? betaChipClassName : '', {
              [classes.chip]: true,
            })}
            color="primary"
            component="span"
          />
        ) : null}
      </Box>
    </Link>
  );
});

interface PrefetchPrimaryLinkProps extends PrimaryLinkProps {
  prefetchRequestCondition: boolean;
  prefetchRequestFn: () => void;
}

// Wrapper around PrimaryLink that includes the usePrefetchHook.
export const PrefetchPrimaryLink = React.memo(
  (props: PrefetchPrimaryLinkProps) => {
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
