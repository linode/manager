import { useAccountUser, useAccountUsers, useProfile } from '@linode/queries';
import { CircleProgress, ErrorState, NotFound } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import UserPermissions from './UserPermissions';
import { UserProfile } from './UserProfile/UserProfile';

export const UserDetail = () => {
  const { username } = useParams({
    from: '/account/users/$username',
  });

  const location = useLocation();

  const { data: profile } = useProfile();
  const { data: users, isLoading: isLoadingUsers } = useAccountUsers({});

  const isValidUsername = React.useMemo(() => {
    if (!users?.data || !username) return false;
    return users.data.some((user) => user.username === username);
  }, [users?.data, username]);

  const {
    data: user,
    error,
    isLoading: isLoadingUser,
  } = useAccountUser(isValidUsername ? (username ?? '') : '');

  const queryClient = useQueryClient();

  const { tabs, handleTabChange, tabIndex } = useTabs([
    {
      to: '/account/users/$username/profile',
      title: 'User Profile',
    },
    {
      to: '/account/users/$username/permissions',
      title: 'User Permissions',
    },
  ]);

  const isProxyUser = user?.user_type === 'proxy';
  const isLoading = isLoadingUsers || isLoadingUser;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (users?.data && !isValidUsername) {
    return <NotFound />;
  }

  if (error) {
    return (
      <React.Fragment>
        <LandingHeader title="User Details" />
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
        title={user?.username || username}
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        {!isProxyUser && <TanStackTabLinkList tabs={tabs} />}
        <TabPanels>
          <SafeTabPanel index={0}>
            <UserProfile />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <UserPermissions
              accountUsername={profile?.username}
              currentUsername={user?.username || username}
              queryClient={queryClient}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
