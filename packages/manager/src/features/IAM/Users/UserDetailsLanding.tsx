import React from 'react';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { IAM_DOCS_LINK, IAM_LABEL } from '../Shared/constants';

const UserDetails = React.lazy(() =>
  import('./UserDetails/UserProfile').then((module) => ({
    default: module.UserProfile,
  }))
);

const UserRoles = React.lazy(() =>
  import('./UserRoles/UserRoles').then((module) => ({
    default: module.UserRoles,
  }))
);

const UserEntities = React.lazy(() =>
  import('./UserEntities/UserEntities').then((module) => ({
    default: module.UserEntities,
  }))
);

export const UserDetailsLanding = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const history = useHistory();

  const tabs = [
    {
      routeName: `/iam/users/${username}/details`,
      title: 'User Details',
    },
    {
      routeName: `/iam/users/${username}/roles`,
      title: 'Assigned Roles',
    },
    {
      routeName: `/iam/users/${username}/entities`,
      title: 'Entity Access',
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

  let idx = 0;

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: IAM_LABEL,
              position: 1,
            },
          ],
          labelOptions: {
            noCap: true,
          },
          pathname: location.pathname,
        }}
        docsLink={IAM_DOCS_LINK}
        removeCrumbX={4}
        spacingBottom={4}
        title={username}
      />
      <Tabs index={getDefaultTabIndex()} onChange={navToURL}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={idx}>
            <UserDetails />
          </SafeTabPanel>
          <SafeTabPanel index={++idx}>
            <UserRoles />
          </SafeTabPanel>
          <SafeTabPanel index={++idx}>
            <UserEntities />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
