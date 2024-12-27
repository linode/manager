import { Box, Tooltip } from '@linode/ui';
import { Hidden } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import IAM from 'src/assets/icons/entityIcons/iam.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import Longview from 'src/assets/icons/longview.svg';
import More from 'src/assets/icons/more.svg';
import PinFilledIcon from 'src/assets/icons/pin-filled.svg';
import PinOutlineIcon from 'src/assets/icons/pin-outline.svg';
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
  StyledAkamaiLogo,
  StyledDivider,
  StyledGrid,
  StyledIconButton,
  StyledLogoBox,
} from './PrimaryNav.styles';
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

  const collapsedAccordions = collapsedSideNavPreference ?? [];

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const productFamilyLinkGroups: ProductFamilyLinkGroup<
    PrimaryLinkType[]
  >[] = React.useMemo(
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
        icon: <Longview />,
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
    let updatedCollapsedAccordions;
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
      <Hidden mdUp>
        <Grid sx={{ width: '100%' }}>
          <StyledLogoBox>
            <Link
              aria-label="Akamai - Dashboard"
              onClick={closeMenu}
              style={{ lineHeight: 0 }}
              title="Akamai - Dashboard"
              to={`/dashboard`}
            >
              <StyledAkamaiLogo width={83} />
            </Link>
          </StyledLogoBox>
          <StyledDivider />
        </Grid>
      </Hidden>
      <Grid
        sx={(theme) => ({
          flex: '1 1 0%',
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarColor:
            theme.name === 'dark'
              ? `${theme.bg.primaryNavPaper} ${theme.bg.appBar} `
              : `${theme.color.grey4} ${theme.bg.primaryNavPaper}`,
          width: '100%',
        })}
        direction="column"
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
              {productFamily.name ? ( // TODO: we can remove this conditional when Managed is removed
                <>
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
                  <StyledDivider />
                </>
              ) : (
                <Box className={`StyledSingleLinkBox-${idx}`}>
                  {PrimaryLinks}
                </Box>
              )}
            </div>
          );
        })}
      </Grid>
      <Hidden mdDown>
        <Box padding={1}>
          {!isCollapsed ? (
            <Tooltip placement="top-end" title={'unpin side menu'}>
              <StyledIconButton
                aria-label="unpin menu"
                data-testid="unpin-nav-menu"
                onClick={desktopMenuToggle}
                size="small"
              >
                <PinFilledIcon />
              </StyledIconButton>
            </Tooltip>
          ) : (
            <Tooltip placement="top-end" title={'pin side menu'}>
              <StyledIconButton
                aria-label="pin menu"
                data-testid="pin-nav-menu"
                onClick={desktopMenuToggle}
                size="small"
              >
                <PinOutlineIcon sx={{ fontSize: 16 }} />
              </StyledIconButton>
            </Tooltip>
          )}
        </Box>
      </Hidden>
    </StyledGrid>
  );
};

export default React.memo(PrimaryNav);
