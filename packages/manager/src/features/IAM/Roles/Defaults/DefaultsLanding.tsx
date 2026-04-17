import { Breadcrumb, BreadcrumbItem } from '@akamai/cds-components/react';
import { NewFeatureChip } from '@linode/ui';
import { TabPanels } from '@reach/tabs';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { useIsIAMEnabled } from '../../hooks/useIsIAMEnabled';
import { IAM_LABEL } from '../../Shared/constants';
import { LandingHeader } from '../../Shared/LandingHeader/LandingHeader';

export const DefaultsLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/roles/defaults/roles`,
      title: 'Default Roles',
    },
    {
      to: `/iam/roles/defaults/entity-access`,
      title: 'Default Entity Access',
    },
  ]);

  if (location.pathname === '/iam/roles/defaults') {
    navigate({ to: '/iam/roles/defaults/roles', replace: true });
  }

  return (
    <>
      <LandingHeader spacingBottom={4}>
        <Breadcrumb>
          <BreadcrumbItem onCdsBreadcrumbClick={() => navigate({ to: '/iam' })}>
            {IAM_LABEL}
            {showNewBadge ? <NewFeatureChip /> : null}
          </BreadcrumbItem>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/roles' })}
          >
            Roles
          </BreadcrumbItem>
          <BreadcrumbItem>Default Roles for Delegate Users</BreadcrumbItem>
        </Breadcrumb>
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
};
