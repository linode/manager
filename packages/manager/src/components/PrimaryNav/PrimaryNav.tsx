import {
  useAccountSettings,
  useMutatePreferences,
  usePreferences,
} from '@linode/queries';
import { Box } from '@linode/ui';
import { useLocation } from '@tanstack/react-router';
import * as React from 'react';

import Compute from 'src/assets/icons/entityIcons/compute.svg';
import CoreUser from 'src/assets/icons/entityIcons/coreuser.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Monitor from 'src/assets/icons/entityIcons/monitor.svg';
import Networking from 'src/assets/icons/entityIcons/networking.svg';
import Storage from 'src/assets/icons/entityIcons/storage.svg';
import More from 'src/assets/icons/more.svg';
import {
  PRIMARY_NAV_TOGGLE_HEIGHT,
  SIDEBAR_WIDTH,
} from 'src/components/PrimaryNav/constants';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useIsACLPLogsEnabled } from 'src/features/Delivery/deliveryUtils';
import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useIsNetworkLoadBalancerEnabled } from 'src/features/NetworkLoadBalancers/utils';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { useFlags } from 'src/hooks/useFlags';

import PrimaryLink from './PrimaryLink';
import { StyledAccordion } from './PrimaryNav.styles';
import { PrimaryNavToggle } from './PrimaryNavToggle';
import { linkIsActive } from './utils';

import type { PrimaryLink as PrimaryLinkType } from './PrimaryLink';

export type NavEntity =
  | 'Account'
  | 'Account Settings'
  | 'Alerts'
  | 'Betas'
  | 'Billing'
  | 'Cloud Load Balancers'
  | 'Dashboard'
  | 'Databases'
  | 'Domains'
  | 'Firewalls'
  | 'Help & Support'
  | 'Identity & Access'
  | 'Images'
  | 'Kubernetes'
  | 'Linodes'
  | 'Login History'
  | 'Logs'
  | 'Longview'
  | 'Maintenance'
  | 'Managed'
  | 'Marketplace'
  | 'Metrics'
  | 'Monitor'
  | 'Network Load Balancers'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Groups'
  | 'Quotas'
  | 'Service Transfers'
  | 'StackScripts'
  | 'Users & Grants'
  | 'Volumes'
  | 'VPC';

export type ProductFamily =
  | 'Administration'
  | 'Compute'
  | 'Databases'
  | 'Monitor'
  | 'More'
  | 'Networking'
  | 'Storage';

export interface ProductFamilyLinkGroup<T> {
  icon?: React.JSX.Element;
  links: T;
  name?: ProductFamily;
}

export interface PrimaryNavProps {
  closeMenu: () => void;
  desktopMenuToggle: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav = (props: PrimaryNavProps) => {
  const { closeMenu, desktopMenuToggle, isCollapsed } = props;
  const navItemsRef = React.useRef<HTMLDivElement>(null);
  const primaryNavRef = React.useRef<HTMLDivElement>(null);
  const [navItemsOverflowing, setNavItemsOverflowing] = React.useState(false);

  const flags = useFlags();
  const location = useLocation();

  const { data: accountSettings } = useAccountSettings();

  const isManaged = accountSettings?.managed ?? false;

  const { isACLPEnabled } = useIsACLPEnabled();
  const { isACLPLogsEnabled, isACLPLogsBeta } = useIsACLPLogsEnabled();

  const isAlertsEnabled =
    isACLPEnabled &&
    (flags.aclpAlerting?.alertDefinitions ||
      flags.aclpAlerting?.recentActivity ||
      flags.aclpAlerting?.notificationChannels);

  const { iamRbacPrimaryNavChanges, limitsEvolution } = flags;

  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isDatabasesEnabled, isDatabasesV2Beta } = useIsDatabasesEnabled();

  const { isIAMBeta, isIAMEnabled } = useIsIAMEnabled();
  const { isNetworkLoadBalancerEnabled } = useIsNetworkLoadBalancerEnabled();

  const {
    data: preferences,
    error: preferencesError,
    isLoading: preferencesLoading,
  } = usePreferences();

  const collapsedSideNavPreference =
    preferences?.collapsedSideNavProductFamilies;

  const collapsedAccordions = React.useMemo(
    () => collapsedSideNavPreference ?? [1, 2, 3, 4, 5, 6, 7], // by default, we collapse all categories if no preference is set;
    [collapsedSideNavPreference]
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const productFamilyLinkGroups: ProductFamilyLinkGroup<PrimaryLinkType[]>[] =
    React.useMemo(
      () => {
        const groups: ProductFamilyLinkGroup<PrimaryLinkType[]>[] = [
          {
            links: [],
          },
          {
            icon: <Compute />,
            links: [
              {
                display: 'Managed',
                hide: !isManaged,
                to: '/managed',
              },
              {
                display: 'Linodes',
                to: '/linodes',
              },
              {
                display: 'Images',
                to: '/images',
              },
              {
                display: 'Kubernetes',
                to: '/kubernetes/clusters',
              },
              {
                display: 'StackScripts',
                to: '/stackscripts',
              },
              {
                betaChipClassName: 'beta-chip-placement-groups',
                display: 'Placement Groups',
                hide: !isPlacementGroupsEnabled,
                to: '/placement-groups',
              },
              {
                attr: { 'data-qa-one-click-nav-btn': true },
                display: 'Marketplace',
                to: '/linodes/create/marketplace',
              },
            ],
            name: 'Compute',
          },
          {
            icon: <Storage />,
            links: [
              {
                display: 'Object Storage',
                to: '/object-storage',
              },
              {
                display: 'Volumes',
                to: '/volumes',
              },
            ],
            name: 'Storage',
          },
          {
            icon: <Networking />,
            links: [
              {
                display: 'VPC',
                to: '/vpcs',
              },
              {
                display: 'Firewalls',
                to: '/firewalls',
              },
              {
                display: 'Network Load Balancers',
                hide: isNetworkLoadBalancerEnabled,
                to: '/netloadbalancers',
              },
              {
                display: 'NodeBalancers',
                to: '/nodebalancers',
              },
              {
                display: 'Domains',
                to: '/domains',
              },
            ],
            name: 'Networking',
          },
          {
            icon: <Database />,
            links: [
              {
                display: 'Databases',
                hide: !isDatabasesEnabled,
                to: '/databases',
                isBeta: isDatabasesV2Beta,
              },
            ],
            name: 'Databases',
          },
          {
            icon: <Monitor />,
            links: [
              {
                display: 'Metrics',
                hide: !isACLPEnabled,
                to: '/metrics',
                isBeta: flags.aclp?.beta,
              },
              {
                display: 'Alerts',
                hide: !isAlertsEnabled,
                to: '/alerts',
                isBeta: flags.aclp?.beta,
              },
              {
                display: 'Longview',
                to: '/longview',
              },
              {
                display: 'Logs',
                hide: !isACLPLogsEnabled,
                to: '/logs/delivery',
                isBeta: isACLPLogsBeta,
              },
            ],
            name: 'Monitor',
          },
          {
            icon: <More />,
            links: [
              {
                display: 'Betas',
                hide: !flags.selfServeBetas,
                to: '/betas',
              },
              {
                display: 'Identity & Access',
                hide: !isIAMEnabled || iamRbacPrimaryNavChanges,
                to: '/iam',
                isBeta: isIAMBeta,
              },
              {
                display: 'Account',
                hide: iamRbacPrimaryNavChanges,
                to: '/account',
              },
              {
                display: 'Help & Support',
                to: '/support',
              },
            ],
            name: 'More',
          },
        ];

        if (iamRbacPrimaryNavChanges) {
          groups.splice(groups.length - 1, 0, {
            icon: <CoreUser />,
            links: [
              {
                display: 'Billing',
                to: '/billing',
              },
              {
                display: 'Users & Grants',
                hide: isIAMEnabled,
                to: '/users',
              },
              {
                display: 'Identity & Access',
                hide: !isIAMEnabled,
                to: '/iam',
                isBeta: isIAMBeta,
              },
              {
                display: 'Quotas',
                hide: !limitsEvolution?.enabled,
                to: '/quotas',
              },
              {
                display: 'Login History',
                to: '/login-history',
              },
              {
                display: 'Service Transfers',
                to: '/service-transfers',
              },
              {
                display: 'Maintenance',
                to: '/maintenance',
              },
              {
                display: 'Account Settings',
                to: '/account-settings',
              },
            ],
            name: 'Administration',
          });
        }

        return groups;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        isDatabasesEnabled,
        isDatabasesV2Beta,
        isManaged,
        isPlacementGroupsEnabled,
        isACLPEnabled,
        isACLPLogsBeta,
        isACLPLogsEnabled,
        isIAMBeta,
        isIAMEnabled,
        iamRbacPrimaryNavChanges,
        isNetworkLoadBalancerEnabled,
        limitsEvolution,
      ]
    );

  const accordionClicked = React.useCallback(
    (index: number) => {
      let updatedCollapsedAccordions: number[];
      if (collapsedAccordions.includes(index)) {
        updatedCollapsedAccordions = collapsedAccordions.filter(
          (accIndex) => accIndex !== index
        );
      } else {
        updatedCollapsedAccordions = [...collapsedAccordions, index];
      }
      updatePreferences({
        collapsedSideNavProductFamilies: updatedCollapsedAccordions,
      });
    },
    [collapsedAccordions, updatePreferences]
  );

  const checkOverflow = React.useCallback(() => {
    if (navItemsRef.current && primaryNavRef.current) {
      const navItemsHeight = navItemsRef.current.scrollHeight;
      const primaryNavHeight = primaryNavRef.current.scrollHeight;
      setNavItemsOverflowing(navItemsHeight > primaryNavHeight);
    }
  }, []);

  // Effects to determine if we need to show a visual overflow indicator
  // if the nav items are taller than the primary nav
  React.useEffect(() => {
    if (!navItemsRef.current || !primaryNavRef.current) {
      return;
    }

    // MutationObserver for DOM changes
    const observer = new MutationObserver(() => {
      checkOverflow();
    });

    // Observe both elements for any changes to their subtrees
    observer.observe(navItemsRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    observer.observe(primaryNavRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    // ResizeObserver for size changes
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    resizeObserver.observe(document.body);

    // Initial check
    checkOverflow();

    return () => {
      observer.disconnect();
    };
  }, [checkOverflow]);

  // This effect will only run if the collapsedSideNavPreference is not set
  // When a user lands on a page and does not have any preference set,
  // we want to expand the accordion that contains the active link for convenience and discoverability
  React.useEffect(() => {
    // Wait for preferences to load or if there's an error
    if (preferencesLoading || preferencesError) {
      return;
    }

    // Wait for preferences data to be available (not just the field, but the whole object)
    if (!preferences) {
      return;
    }

    // If user has already set collapsedSideNavProductFamilies preference, don't override it
    if (collapsedSideNavPreference) {
      return;
    }

    // Find the index of the group containing the active link and expand it
    const activeGroupIndex = productFamilyLinkGroups.findIndex((group) => {
      const filteredLinks = group.links.filter((link) => !link.hide);

      return filteredLinks.some((link) =>
        linkIsActive(location.pathname, link.to)
      );
    });

    if (activeGroupIndex !== -1) {
      accordionClicked(activeGroupIndex);
    }
  }, [
    accordionClicked,
    location.pathname,
    location.search,
    productFamilyLinkGroups,
    collapsedSideNavPreference,
    preferences,
    preferencesLoading,
    preferencesError,
  ]);

  let activeProductFamily = '';

  return (
    <Box
      alignItems="flex-start"
      display="flex"
      flexDirection="column"
      gap={0}
      height={{
        md: `calc(100% - ${PRIMARY_NAV_TOGGLE_HEIGHT}px)`,
        xs: '100%',
      }}
      id="main-navigation"
      justifyContent="flex-start"
      ref={primaryNavRef}
      role="navigation"
      sx={{
        '&:hover': {
          '.primary-nav-toggle': {
            justifyContent: 'flex-end',
            width: SIDEBAR_WIDTH,
          },
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        ref={navItemsRef}
        sx={(theme) => ({
          flexGrow: 1,
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarColor: `${theme.color.grey4} transparent `,
        })}
        width="100%"
      >
        {productFamilyLinkGroups.map((productFamily, idx) => {
          const filteredLinks = productFamily.links.filter(
            (link) => !link.hide
          );

          if (filteredLinks.length === 0) {
            return null;
          }

          const PrimaryLinks = filteredLinks.map((link) => {
            const isActiveLink = Boolean(
              linkIsActive(location.pathname, link.to)
            );

            if (isActiveLink) {
              activeProductFamily = productFamily.name ?? '';
            }

            const props = {
              closeMenu,
              isActiveLink,
              isCollapsed,
              ...link,
            };

            return <PrimaryLink {...props} key={link.display} />;
          });

          return (
            <div key={idx} style={{ width: 'inherit' }}>
              <StyledAccordion
                expanded={!collapsedAccordions.includes(idx)}
                heading={
                  <>
                    <Box component="span" flexShrink={0}>
                      {productFamily.icon}
                    </Box>
                    <span className="productFamilyName">
                      {productFamily.name}
                    </span>
                  </>
                }
                isActiveProductFamily={
                  activeProductFamily === productFamily.name
                }
                isCollapsed={isCollapsed}
                onChange={() => accordionClicked(idx)}
              >
                {PrimaryLinks}
              </StyledAccordion>
            </div>
          );
        })}
      </Box>
      <PrimaryNavToggle
        areNavItemsOverflowing={navItemsOverflowing}
        desktopMenuToggle={desktopMenuToggle}
        isCollapsed={isCollapsed}
      />
    </Box>
  );
};

export default React.memo(PrimaryNav);
