import * as React from 'react';
import { useLocation } from 'react-router-dom';

import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import IAM from 'src/assets/icons/entityIcons/iam.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import Monitor from 'src/assets/icons/entityIcons/monitor.svg';
import Networking from 'src/assets/icons/entityIcons/networking.svg';
import More from 'src/assets/icons/more.svg';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useIsIAMEnabled } from 'src/features/IAM/Shared/utilities';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountSettings } from 'src/queries/account/settings';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import PrimaryLink from './PrimaryLink';
import {
  StyledAccordion,
  StyledGrid,
  StyledMenuGrid,
} from './PrimaryNav.styles';
import { PrimaryNavToggle } from './PrimaryNavToggle';
import { linkIsActive } from './utils';

import type { PrimaryLink as PrimaryLinkType } from './PrimaryLink';

export type NavEntity =
  | 'Account'
  | 'Betas'
  | 'Cloud Load Balancers'
  | 'Dashboard'
  | 'Databases'
  | 'Domains'
  | 'Firewalls'
  | 'Help & Support'
  | 'Identity and Access'
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

export type ProductFamily =
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

  const flags = useFlags();
  const location = useLocation();

  const { data: accountSettings } = useAccountSettings();
  const isManaged = accountSettings?.managed ?? false;

  const { isACLPEnabled } = useIsACLPEnabled();

  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isDatabasesEnabled, isDatabasesV2Beta } = useIsDatabasesEnabled();

  const { isIAMBeta, isIAMEnabled } = useIsIAMEnabled();

  const { data: collapsedSideNavPreference } = usePreferences(
    (preferences) => preferences?.collapsedSideNavProductFamilies
  );

  const collapsedAccordions = collapsedSideNavPreference ?? [1, 2, 3, 4, 5, 6]; // by default, we collapse all categories if no preference is set;

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const productFamilyLinkGroups: ProductFamilyLinkGroup<
    PrimaryLinkType[]
  >[] = React.useMemo(
    () => [
      {
        links: [],
      },
      {
        icon: <Linode />,
        links: [
          {
            activeLinks: [
              '/managed',
              '/managed/summary',
              '/managed/monitors',
              '/managed/ssh-access',
              '/managed/credentials',
              '/managed/contacts',
            ],
            display: 'Managed',
            hide: !isManaged,
            href: '/managed',
          },
          {
            activeLinks: ['/linodes', '/linodes/create'],
            display: 'Linodes',
            href: '/linodes',
          },
          {
            activeLinks: [
              '/images/create/create-image',
              '/images/create/upload-image',
            ],
            display: 'Images',
            href: '/images',
          },
          {
            activeLinks: ['/kubernetes/create'],
            display: 'Kubernetes',
            href: '/kubernetes/clusters',
          },
          {
            display: 'StackScripts',
            href: '/stackscripts',
          },
          {
            betaChipClassName: 'beta-chip-placement-groups',
            display: 'Placement Groups',
            hide: !isPlacementGroupsEnabled,
            href: '/placement-groups',
          },
          {
            attr: { 'data-qa-one-click-nav-btn': true },
            display: 'Marketplace',
            href: '/linodes/create?type=One-Click',
          },
        ],
        name: 'Compute',
      },
      {
        icon: <Storage />,
        links: [
          {
            activeLinks: [
              '/object-storage/buckets',
              '/object-storage/access-keys',
            ],
            display: 'Object Storage',
            href: '/object-storage/buckets',
          },
          {
            display: 'Volumes',
            href: '/volumes',
          },
        ],
        name: 'Storage',
      },
      {
        icon: <Networking />,
        links: [
          {
            display: 'VPC',
            href: '/vpcs',
          },
          {
            display: 'Firewalls',
            href: '/firewalls',
          },
          {
            display: 'NodeBalancers',
            href: '/nodebalancers',
          },
          {
            display: 'Domains',
            href: '/domains',
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
            href: '/databases',
            isBeta: isDatabasesV2Beta,
          },
        ],
        name: 'Databases',
      },
      {
        icon: <Monitor />,
        links: [
          {
            display: 'Longview',
            href: '/longview',
          },
          {
            display: 'Monitor',
            hide: !isACLPEnabled,
            href: '/monitor',
            isBeta: flags.aclp?.beta,
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
            href: '/betas',
          },
          {
            display: 'Identity and Access',
            hide: !isIAMEnabled,
            href: '/iam',
            icon: <IAM />,
            isBeta: isIAMBeta,
          },
          {
            display: 'Account',
            href: '/account',
          },
          {
            display: 'Help & Support',
            href: '/support',
          },
        ],
        name: 'More',
      },
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

  const accordionClicked = (index: number) => {
    let updatedCollapsedAccordions: number[] = [0, 1, 2, 3, 4, 5];
    if (collapsedAccordions.includes(index)) {
      updatedCollapsedAccordions = collapsedAccordions.filter(
        (accIndex) => accIndex !== index
      );
      updatePreferences({
        collapsedSideNavProductFamilies: updatedCollapsedAccordions,
      });
    } else {
      updatedCollapsedAccordions = [...collapsedAccordions, index];
      updatePreferences({
        collapsedSideNavProductFamilies: updatedCollapsedAccordions,
      });
    }
  };

  // This effect will only run if the collapsedSideNavPreference is not set
  // When a user lands on a page and does not have any preference set,
  // we want to expand the accordion that contains the active link for convenience and discoverability
  React.useEffect(() => {
    if (collapsedSideNavPreference) {
      return;
    }

    // Find the index of the group containing the active link and expand it
    const activeGroupIndex = productFamilyLinkGroups.findIndex((group) => {
      const filteredLinks = group.links.filter((link) => !link.hide);

      return filteredLinks.some((link) =>
        linkIsActive(
          link.href,
          location.search,
          location.pathname,
          link.activeLinks
        )
      );
    });

    if (activeGroupIndex !== -1) {
      accordionClicked(activeGroupIndex);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.pathname,
    location.search,
    productFamilyLinkGroups,
    collapsedSideNavPreference,
  ]);

  let activeProductFamily = '';

  return (
    <StyledGrid
      alignItems="flex-start"
      container
      direction="column"
      id="main-navigation"
      justifyContent="flex-start"
      role="navigation"
      spacing={0}
      wrap="nowrap"
    >
      <StyledMenuGrid direction="column">
        {productFamilyLinkGroups.map((productFamily, idx) => {
          const filteredLinks = productFamily.links.filter(
            (link) => !link.hide
          );

          if (filteredLinks.length === 0) {
            return null;
          }

          const PrimaryLinks = filteredLinks.map((link) => {
            const isActiveLink = Boolean(
              linkIsActive(
                link.href,
                location.search,
                location.pathname,
                link.activeLinks
              )
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
                heading={
                  <>
                    {productFamily.icon}
                    <p>{productFamily.name}</p>
                  </>
                }
                isActiveProductFamily={
                  activeProductFamily === productFamily.name
                }
                expanded={!collapsedAccordions.includes(idx)}
                isCollapsed={isCollapsed}
                onChange={() => accordionClicked(idx)}
              >
                {PrimaryLinks}
              </StyledAccordion>
            </div>
          );
        })}
      </StyledMenuGrid>
      <PrimaryNavToggle
        desktopMenuToggle={desktopMenuToggle}
        isCollapsed={isCollapsed}
      />
    </StyledGrid>
  );
};

export default React.memo(PrimaryNav);
