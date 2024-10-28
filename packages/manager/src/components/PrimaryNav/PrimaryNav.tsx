import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import Longview from 'src/assets/icons/longview.svg';
import More from 'src/assets/icons/more.svg';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
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
  StyledAkamaiLogo,
  StyledGrid,
  StyledLink,
  StyledLogoBox,
} from './PrimaryNav.styles';
import { linkIsActive } from './utils';

import type { PrimaryLink as PrimaryLinkType } from './PrimaryLink';

export type NavEntity =
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

interface PrimaryLinkGroup {
  icon?: React.JSX.Element;
  links: PrimaryLinkType[];
  title?: string;
}

export interface PrimaryNavProps {
  closeMenu: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav = (props: PrimaryNavProps) => {
  const { closeMenu, isCollapsed } = props;

  const flags = useFlags();
  const location = useLocation();

  const { data: accountSettings } = useAccountSettings();
  const isManaged = accountSettings?.managed ?? false;

  const { isACLPEnabled } = useIsACLPEnabled();

  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isDatabasesEnabled, isDatabasesV2Beta } = useIsDatabasesEnabled();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const primaryLinkGroups: PrimaryLinkGroup[] = React.useMemo(
    () => [
      {
        links: [
          {
            display: 'Managed',
            hide: !isManaged,
            href: '/managed',
          },
        ],
      },
      {
        icon: <Linode />,
        links: [
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
        title: 'Compute',
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
        title: 'Storage',
      },
      {
        icon: <NodeBalancer />,
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
        title: 'Networking',
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
        title: 'Databases',
      },
      {
        icon: <Longview />,
        links: [
          {
            display: 'Longview',
            href: '/longview',
          },
          {
            display: 'Monitor',
            hide: !isACLPEnabled,
            href: '/monitor/cloudpulse',
            isBeta: flags.aclp?.beta,
          },
        ],
        title: 'Monitor',
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
            display: 'Account',
            href: '/account',
          },
          {
            display: 'Help & Support',
            href: '/support',
          },
        ],
        title: 'More',
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

  const [collapsedAccordions, setCollapsedAccordions] = React.useState<
    number[]
  >(preferences?.collapsedSideNavProductFamilies ?? []);

  const accordionClicked = (index: number) => {
    let updatedCollapsedAccordions;
    if (collapsedAccordions.includes(index)) {
      updatedCollapsedAccordions = collapsedAccordions.filter(
        (accIndex) => accIndex !== index
      );
      updatePreferences({
        collapsedSideNavProductFamilies: updatedCollapsedAccordions,
      });
      setCollapsedAccordions(updatedCollapsedAccordions);
    } else {
      updatedCollapsedAccordions = [...collapsedAccordions, index];
      updatePreferences({
        collapsedSideNavProductFamilies: updatedCollapsedAccordions,
      });
      setCollapsedAccordions(updatedCollapsedAccordions);
    }
  };

  let activeProductFamily = '';

  return (
    <StyledGrid
      alignItems="flex-start"
      container
      direction="column"
      id="main-navigation"
      isCollapsed={isCollapsed}
      justifyContent="flex-start"
      role="navigation"
      spacing={0}
      wrap="nowrap"
    >
      <Grid sx={{ width: '100%' }}>
        <StyledLogoBox isCollapsed={isCollapsed}>
          <StyledLink
            aria-label="Akamai - Dashboard"
            isCollapsed={isCollapsed}
            onClick={closeMenu}
            title="Akamai - Dashboard"
            to={`/dashboard`}
          >
            <StyledAkamaiLogo width={83} />
          </StyledLink>
        </StyledLogoBox>
      </Grid>

      {primaryLinkGroups.map((linkGroup, idx) => {
        const filteredLinks = linkGroup.links.filter((link) => !link.hide);
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
            activeProductFamily = linkGroup.title ?? '';
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
            <Divider
              sx={(theme) => ({
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                borderColor:
                  theme.name === 'light'
                    ? theme.borderColors.dividerDark
                    : 'rgba(0, 0, 0, 0.19)',
                color: '#222',
              })}
              spacingBottom={0}
              spacingTop={0}
            />
            {linkGroup.title ? ( // TODO: we can remove this conditional when Managed is removed
              <StyledAccordion
                heading={
                  <>
                    {linkGroup.icon}
                    <p>{linkGroup.title}</p>
                  </>
                }
                expanded={!collapsedAccordions.includes(idx)}
                isActiveProductFamily={activeProductFamily === linkGroup.title}
                isCollapsed={isCollapsed}
                onChange={() => accordionClicked(idx)}
              >
                {PrimaryLinks}
              </StyledAccordion>
            ) : (
              // currently just Managed
              <Box paddingBottom={1} paddingTop={1}>
                {PrimaryLinks}
              </Box>
            )}
          </div>
        );
      })}
    </StyledGrid>
  );
};

export default React.memo(PrimaryNav);
