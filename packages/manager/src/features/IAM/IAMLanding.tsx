import { Breadcrumb, BreadcrumbItem } from '@akamai/cds-components/react';
import { NewFeatureChip } from '@linode/ui';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
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
import { DocsLink } from './Shared/DocsLink/DocsLink';
import { LandingHeader } from './Shared/LandingHeader/LandingHeader';

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

  if (location.pathname === '/iam') {
    navigate({ to: '/iam/users', replace: true });
  }

  return (
    <>
      <LandingHeader spacingBottom={4}>
        <Breadcrumb>
          <BreadcrumbItem>
            Identity and Access
            {showNewBadge ? <NewFeatureChip /> : null}
          </BreadcrumbItem>
        </Breadcrumb>
        <DocsLink
          href={tabIndex === 0 ? IAM_DOCS_LINK : ROLES_LEARN_MORE_LINK}
        />
      </LandingHeader>
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
