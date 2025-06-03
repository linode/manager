import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import { IAM_DOCS_LINK } from './Shared/constants';

const Users = React.lazy(() =>
  import('./Users/UsersTable/Users').then((module) => ({
    default: module.UsersLanding,
  }))
);

const Roles = React.lazy(() =>
  import('./Roles/Roles').then((module) => ({
    default: module.RolesLanding,
  }))
);

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

  let idx = 0;

  return (
    <>
      <DocumentTitleSegment segment="Identity and Access" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={idx}>
              <Users />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <Roles />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
});
