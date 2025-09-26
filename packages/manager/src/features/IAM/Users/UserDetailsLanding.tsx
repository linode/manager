import { Outlet, useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import {
  IAM_LABEL,
  USER_DETAILS_LINK,
  USER_ENTITIES_LINK,
  USER_ROLES_LINK,
} from '../Shared/constants';

export const UserDetailsLanding = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const flags = useFlags();
  const isIAMDelegationEnabled = flags?.iamDelegation?.enabled;

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/users/$username/details`,
      title: 'User Details',
    },
    {
      to: `/iam/users/$username/roles`,
      title: 'Assigned Roles',
    },
    {
      to: `/iam/users/$username/entities`,
      title: 'Entity Access',
    },
    {
      to: `/iam/users/$username/delegations`,
      title: 'Account Delegations',
      hide: !isIAMDelegationEnabled,
    },
  ]);

  const docsLinks = [USER_DETAILS_LINK, USER_ROLES_LINK, USER_ENTITIES_LINK];
  const docsLink = docsLinks[tabIndex] ?? USER_DETAILS_LINK;

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
        docsLink={docsLink}
        removeCrumbX={4}
        spacingBottom={4}
        title={username}
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <Outlet />
        </TabPanels>
      </Tabs>
    </>
  );
};
