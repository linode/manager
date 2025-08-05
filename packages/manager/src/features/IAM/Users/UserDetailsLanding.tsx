import { Outlet, useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import { useIsIAMEnabled } from '../hooks/useIsIAMEnabled';
import { IAM_DOCS_LINK, IAM_LABEL } from '../Shared/constants';

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

  const { isIAMEnabled } = useIsIAMEnabled();
  const navigate = useNavigate();

  if (!isIAMEnabled && username) {
    const isOnDetails = location.pathname === `/iam/users/${username}/details`;
    const base = `/account/users/${username}`;
    const path = !isOnDetails ? '/permissions' : '';
    navigate({
      to: base + path,
    });
  }

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
          <Outlet />
        </TabPanels>
      </Tabs>
    </>
  );
};
