import * as React from 'react';
import { matchPath } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import type { RouteComponentProps } from 'react-router-dom';
type Props = RouteComponentProps<{}>;

const Users = React.lazy(() =>
  import('./Users/Users').then((module) => ({
    default: module.UsersLanding,
  }))
);

const Roles = React.lazy(() =>
  import('./Roles/Roles').then((module) => ({
    default: module.RolesLanding,
  }))
);

export const IdentityAccessManagementLanding = React.memo((props: Props) => {
  const tabs = [
    {
      routeName: `${props.match.url}/users`,
      title: 'Users',
    },
    {
      routeName: `${props.match.url}/roles`,
      title: 'Roles',
    },
  ];

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    return tabChoice;
  };

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/iam',
    },
    docsLink:
      'https://www.linode.com/docs/platform/identity-access-management/',
    entity: 'Identity and Access',
    title: 'Identity and Access',
  };

  let idx = 0;

  return (
    <>
      <DocumentTitleSegment segment="Identity and Access" />
      <LandingHeader {...landingHeaderProps} />

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
