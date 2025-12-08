import { Chip, NewFeatureChip, styled } from '@linode/ui';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { useDelegationRole } from './hooks/useDelegationRole';
import { useIsIAMDelegationEnabled } from './hooks/useIsIAMEnabled';
import { IAM_DOCS_LINK, ROLES_LEARN_MORE_LINK } from './Shared/constants';

export const IdentityAccessLanding = React.memo(() => {
  const flags = useFlags();
  const showLimitedAvailabilityBadges = flags.iamLimitedAvailabilityBadges;
  const location = useLocation();
  const navigate = useNavigate();
  const { isParentAccount } = useDelegationRole();
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/users`,
      title: 'Users',
    },
    {
      to: `/iam/roles`,
      title: 'Roles',
    },
    {
      hide: !isIAMDelegationEnabled || !isParentAccount,
      to: `/iam/delegations`,
      title: 'Account Delegations',
    },
  ]);

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/iam',
    },
    docsLink: tabIndex === 0 ? IAM_DOCS_LINK : ROLES_LEARN_MORE_LINK,
    entity: 'Identity and Access',
    title: 'Identity and Access',
  };

  if (location.pathname === '/iam') {
    navigate({ to: '/iam/users' });
  }

  return (
    <>
      <LandingHeader
        {...landingHeaderProps}
        breadcrumbProps={{
          labelOptions: {
            suffixComponent: showLimitedAvailabilityBadges ? (
              <>
                <NewFeatureChip />
                <StyledLimitedAvailabilityChip label="Limited availability" />
              </>
            ) : null,
          },
          removeCrumbX: 1,
        }}
        spacingBottom={4}
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <Outlet />
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});

const StyledLimitedAvailabilityChip = styled(Chip, {
  label: 'StyledLimitedAvailabilityChip',
  shouldForwardProp: (prop) => prop !== 'color',
})(({ theme }) => ({
  '& .MuiChip-label': {
    padding: 0,
  },
  background: theme.tokens.component.Badge.Informative.Subtle.Background,
  color: theme.tokens.component.Badge.Informative.Subtle.Text,
  font: theme.font.bold,
  fontSize: '12px',
  lineHeight: '12px',
  height: 16,
  letterSpacing: '.22px',
  padding: theme.spacingFunction(4),
}));
