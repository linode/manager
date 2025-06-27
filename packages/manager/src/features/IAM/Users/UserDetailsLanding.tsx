import { useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

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
  const { username } = useParams({ from: '/iam/users/$username' });
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
  ]);

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
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <UserDetails />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <UserRoles />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <UserEntities />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
