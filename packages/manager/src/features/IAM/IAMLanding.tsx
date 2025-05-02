import * as React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

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
  const history = useHistory();
  const location = useLocation();

  const tabs = [
    {
      routeName: `/iam/users`,
      title: 'Users',
    },
    {
      routeName: `/iam/roles`,
      title: 'Roles',
    },
  ];

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const getDefaultTabIndex = () => {
    return (
      tabs.findIndex((tab) =>
        Boolean(matchPath(tab.routeName, { path: location.pathname }))
      ) || 0
    );
  };

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

      <Tabs index={getDefaultTabIndex()} onChange={navToURL}>
        <TabLinkList tabs={tabs} />

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
