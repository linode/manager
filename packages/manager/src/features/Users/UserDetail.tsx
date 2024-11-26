import {
  CircleProgress,
  SafeTabPanel,
  TabLinkList,
  TabPanels,
  Tabs,
} from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { useAccountUser } from 'src/queries/account/users';
import { useProfile } from 'src/queries/profile/profile';

import UserPermissions from './UserPermissions';
import { UserProfile } from './UserProfile/UserProfile';

export const UserDetail = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const history = useHistory();

  const { data: profile } = useProfile();
  const { data: user, error, isLoading } = useAccountUser(username ?? '');

  const queryClient = useQueryClient();

  const tabs = [
    {
      routeName: `/account/users/${username}/profile`,
      title: 'User Profile',
    },
    {
      routeName: `/account/users/${username}/permissions`,
      title: 'User Permissions',
    },
  ];

  const currentTabIndex = tabs.findIndex((tab) =>
    location.pathname.includes(tab.routeName)
  );

  const isProxyUser = user?.user_type === 'proxy';

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <React.Fragment>
        <LandingHeader title={username || ''} />
        <ErrorState errorText={error[0].reason} />
      </React.Fragment>
    );
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          labelOptions: {
            noCap: true,
          },
          pathname: location.pathname,
        }}
        removeCrumbX={4}
        title={username}
      />
      <Tabs
        index={currentTabIndex === -1 ? 0 : currentTabIndex}
        onChange={(index) => history.push(tabs[index].routeName)}
      >
        {!isProxyUser && <TabLinkList tabs={tabs} />}
        <TabPanels>
          <SafeTabPanel index={0}>
            <UserProfile />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <UserPermissions
              accountUsername={profile?.username}
              currentUsername={username}
              queryClient={queryClient}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export const userDetailLazyRoute = createLazyRoute('/account/users/$username')({
  component: UserDetail,
});
