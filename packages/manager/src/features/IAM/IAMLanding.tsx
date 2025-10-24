import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import { useDelegationRole } from './hooks/useDelegationRole';
import { useIsIAMDelegationEnabled } from './hooks/useIsIAMEnabled';
import { IAM_DOCS_LINK, ROLES_LEARN_MORE_LINK } from './Shared/constants';

export const IdentityAccessLanding = React.memo(() => {
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
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
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
