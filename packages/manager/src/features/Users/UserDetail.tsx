import { useAccountUser, useProfile } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import UserPermissions from './UserPermissions';
import { UserProfile } from './UserProfile/UserProfile';

export const UserDetail = () => {
  const { iamRbacPrimaryNavChanges } = useFlags();
  const { username } = useParams({
    from: iamRbacPrimaryNavChanges
      ? '/users/$username'
      : '/account/users/$username',
  });

  const location = useLocation();

  const { data: profile } = useProfile();
  const { data: user, error, isLoading } = useAccountUser(username ?? '');

  const queryClient = useQueryClient();

  const { tabs, handleTabChange, tabIndex } = useTabs([
    {
      to: iamRbacPrimaryNavChanges
        ? '/users/$username/profile'
        : '/account/users/$username/profile',
      title: 'User Profile',
    },
    {
      to: iamRbacPrimaryNavChanges
        ? '/users/$username/permissions'
        : '/account/users/$username/permissions',
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
              queryClient={queryClient}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
