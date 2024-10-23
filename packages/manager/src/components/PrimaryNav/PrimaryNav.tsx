import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import Account from 'src/assets/icons/account.svg';
import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import Longview from 'src/assets/icons/longview.svg';
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
import {
  StyledAccordion,
  StyledAkamaiLogo,
  StyledGrid,
  StyledLink,
  StyledLogoBox,
} from './PrimaryNav.styles';
import PrimaryLink from './PrimaryLink';

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
  title?: string;
  links: PrimaryLinkType[];
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
        icon: <Linode height={20} width={20} />,
        title: 'Compute',
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
      },
      {
        icon: <Storage height={20} width={20} />,
        title: 'Storage',
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
      },
      {
        icon: <NodeBalancer height={20} width={20} />,
        title: 'Networking',
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
      },
      {
        icon: <Database height={20} width={20} />,
        title: 'Databases',
        links: [
          {
            display: 'Databases',
            hide: !isDatabasesEnabled,
            href: '/databases',

            isBeta: isDatabasesV2Beta,
          },
        ],
      },
      {
        icon: <Longview height={20} width={20} />,
        title: 'Monitor',
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
      },
      {
        icon: <Account height={20} width={20} />,
        title: 'More',
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
    if (collapsedAccordions.includes(index)) {
      setCollapsedAccordions(
        collapsedAccordions.filter((number) => number !== index)
      );
    } else {
      setCollapsedAccordions([...collapsedAccordions, index]);
    }
  };

  React.useEffect(() => {
    updatePreferences({
      collapsedSideNavProductFamilies: collapsedAccordions,
    });
  }, [collapsedAccordions]);

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
          const props = {
            closeMenu,
            isCollapsed,
            locationPathname: location.pathname,
            locationSearch: location.search,
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
            {linkGroup.title ? (
              <StyledAccordion
                heading={
                  <>
                    {linkGroup.icon}
                    <p>{linkGroup.title}</p>
                  </>
                }
                onChange={() => accordionClicked(idx)}
                expanded={!collapsedAccordions.includes(idx)}
                isCollapsed={isCollapsed}
              >
                {PrimaryLinks}
              </StyledAccordion>
            ) : (
              PrimaryLinks
            )}
          </div>
        );
      })}
    </StyledGrid>
  );
};

export default React.memo(PrimaryNav);
