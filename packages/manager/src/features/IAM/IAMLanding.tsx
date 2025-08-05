import { Outlet, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import { useIsIAMEnabled } from './hooks/useIsIAMEnabled';
import { IAM_DOCS_LINK } from './Shared/constants';

export const IdentityAccessLanding = React.memo(() => {
  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/users`,
      title: 'Users',
    },
    {
      to: `/iam/roles`,
      title: 'Roles',
    },
  ]);

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/iam',
    },
    docsLink: IAM_DOCS_LINK,
    entity: 'Identity and Access',
    title: 'Identity and Access',
  };

  const { isIAMEnabled } = useIsIAMEnabled();
  const navigate = useNavigate();

  if (!isIAMEnabled) {
    navigate({
      to: '/account/users',
      replace: true,
    });
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
