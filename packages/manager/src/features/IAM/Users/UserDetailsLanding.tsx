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
import { Permissions } from 'src/features/IAM/Shared/Permissions/Permissions';

import { IAM_LABEL } from '../Shared/constants';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

// just for demonstaring the Permissions component.
// it will be gone with the AssignedPermissions Component in the next PR
const mockPermissionsLong: PermissionType[] = [
  'create_nodebalancer',
  'list_nodebalancers',
  'view_nodebalancer',
  'list_nodebalancer_firewalls',
  'view_nodebalancer_statistics',
  'list_nodebalancer_configs',
  'view_nodebalancer_config',
  'list_nodebalancer_config_nodes',
  'view_nodebalancer_config_node',
  'update_nodebalancer',
  'add_nodebalancer_config',
  'update_nodebalancer_config',
  'rebuild_nodebalancer_config',
  'add_nodebalancer_config_node',
  'update_nodebalancer_config_node',
  'delete_nodebalancer',
  'delete_nodebalancer_config',
  'delete_nodebalancer_config_node',
];

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
            <p>UIE-8138 - User Roles - Assigned Roles Table</p>
            <div
              style={{
                outline: '1px dashed',
                paddingLeft: '42px',
                paddingRight: '10px',
                width: 390,
              }}
            >
              <Permissions permissions={mockPermissionsLong} />
            </div>

            <div
              style={{
                outline: '1px dashed',
                paddingLeft: '32px',
                paddingRight: '10px',
                width: 1190,
              }}
            >
              <Permissions permissions={mockPermissionsLong} />
            </div>
          </SafeTabPanel>
          <SafeTabPanel index={++idx}>
            <p>UIE-8139 - User Roles - Resources Table</p>
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
