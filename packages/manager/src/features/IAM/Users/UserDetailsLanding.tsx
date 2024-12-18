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
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { IAM_LABEL } from '../Shared/constants';
import { UserResources } from './UserResources/UserResources';
import { UserRoles } from './UserRoles/UserRoles';

export const UserDetailsLanding = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const history = useHistory();

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

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
      routeName: `/iam/users/${username}/resources`,
      title: 'Assigned Resources',
    },
  ];

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const getDefaultTabIndex = () => {
    return tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
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
        removeCrumbX={4}
        title={username}
      />
      <Tabs index={getDefaultTabIndex()} onChange={navToURL}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={idx}>
            <p>user details - UIE-8137</p>
          </SafeTabPanel>
          <SafeTabPanel index={++idx}>
            <UserRoles assignedRoles={assignedRoles} />
          </SafeTabPanel>
          <SafeTabPanel index={++idx}>
            <UserResources assignedRoles={assignedRoles} />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
