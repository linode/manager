import { NewFeatureChip } from '@linode/ui';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { useDelegationRole } from './hooks/useDelegationRole';
import {
  useIsIAMDelegationEnabled,
  useIsIAMEnabled,
} from './hooks/useIsIAMEnabled';
import { IAM_DOCS_LINK, ROLES_LEARN_MORE_LINK } from './Shared/constants';
import { SuspenseLoader } from './Shared/SuspenseLoader/SuspenseLoader';

export const IdentityAccessLanding = React.memo(() => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;
  const location = useLocation();
  const navigate = useNavigate();
  const { isParentUserType } = useDelegationRole();
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
      hide: !isIAMDelegationEnabled || !isParentUserType,
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
    navigate({ to: '/iam/users', replace: true });
  }

  return (
    <>
      <LandingHeader
        {...landingHeaderProps}
        breadcrumbProps={{
          labelOptions: {
            suffixComponent: showNewBadge ? <NewFeatureChip /> : null,
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
