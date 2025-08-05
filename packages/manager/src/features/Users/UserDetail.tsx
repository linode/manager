import { useAccountUser, useProfile } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import { useIsIAMEnabled } from '../IAM/hooks/useIsIAMEnabled';
import UserPermissions from './UserPermissions';
import { UserProfile } from './UserProfile/UserProfile';

export const UserDetail = () => {
  const { username } = useParams({
    from: '/account/users/$username',
  });

  const location = useLocation();
  const navigate = useNavigate();

  const { data: profile } = useProfile();
  const { data: user, error, isLoading } = useAccountUser(username ?? '');

  const queryClient = useQueryClient();
  const { isIAMEnabled } = useIsIAMEnabled();

  if (isIAMEnabled && username) {
    const isOnPermissions =
      window.location.pathname === `/account/users/${username}/permissions`;

    navigate({
      to: isOnPermissions
        ? `/iam/users/$username/roles`
        : `/iam/users/$username/details`,
      params: {
        username,
      },
      replace: true,
    });
  }

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

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <React.Fragment>
        <LandingHeader title={user?.username || 'User Details'} />
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
        title={user?.username}
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
              currentUsername={user?.username}
              isIAMEnabled={isIAMEnabled}
              queryClient={queryClient}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
