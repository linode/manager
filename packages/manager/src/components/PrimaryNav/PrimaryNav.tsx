import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import Account from 'src/assets/icons/account.svg';
import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import Longview from 'src/assets/icons/longview.svg';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Divider } from 'src/components/Divider';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { useFlags } from 'src/hooks/useFlags';
import { usePrefetch } from 'src/hooks/usePreFetch';
import { useAccountSettings } from 'src/queries/account/settings';

import {
  StyledAccordion,
  StyledActiveLink,
  StyledAkamaiLogo,
  StyledGrid,
  StyledLink,
  StyledLogoBox,
  StyledPrimaryLinkBox,
} from './PrimaryNav.styles';
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
        },
      ],
      [
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
      [
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
      [
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
      [
        {
          display: 'Databases',
          hide: !isDatabasesEnabled,
          href: '/databases',

          isBeta: isDatabasesV2Beta,
        },
      ],
      [
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
      [
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

  interface AccordionHeading {
    icon: React.JSX.Element;
    title: string;
  }

  interface HeadingIdxMap {
    [key: number]: AccordionHeading;
  }

  const headingIdxMap: HeadingIdxMap = {
    1: {
      icon: <Linode height={20} width={20} />,
      title: 'Compute',
    },
    2: {
      icon: <Storage height={20} width={20} />,
      title: 'Storage',
    },
    3: {
      icon: <NodeBalancer height={20} width={20} />,
      title: 'Networking',
    },
    4: {
      icon: <Database height={20} width={20} />,
      title: 'Databases',
    },
    5: {
      icon: <Longview height={20} width={20} />,
      title: 'Monitor',
    },
    6: {
      icon: <Account height={20} width={20} />,
      title: 'More',
    },
  };

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

      {primaryLinkGroups.map((thisGroup, idx) => {
        const filteredLinks = thisGroup.filter((thisLink) => !thisLink.hide);
        if (filteredLinks.length === 0) {
          return null;
        }
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
            />
            <StyledAccordion
              heading={
                <>
                  {headingIdxMap[idx].icon}
                  <p>{headingIdxMap[idx].title}</p>
                </>
              }
              defaultExpanded={true}
            >
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
            </StyledAccordion>
          </div>
        );
      })}
    </StyledGrid>
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
    <StyledActiveLink
      onClick={(e: React.ChangeEvent<any>) => {
        closeMenu();
        if (onClick) {
          onClick(e);
        }
      }}
      to={href}
      {...prefetchProps}
      {...attr}
      aria-current={isActiveLink}
      data-testid={`menu-item-${display}`}
      isActiveLink={isActiveLink}
    >
      {icon && (
        <div aria-hidden className="icon">
          {icon}
        </div>
      )}
      <StyledPrimaryLinkBox
        className="primaryNavLink"
        isCollapsed={isCollapsed}
      >
        {display}
        {isBeta ? (
          <BetaChip
            className={`${betaChipClassName ? betaChipClassName : ''}`}
            color="primary"
            component="span"
          />
        ) : null}
      </StyledPrimaryLinkBox>
    </StyledActiveLink>
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
