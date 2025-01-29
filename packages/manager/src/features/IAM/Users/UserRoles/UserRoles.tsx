import { Button, Paper, Stack, Typography } from '@linode/ui';
import { isEmpty } from 'ramda';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { Permissions } from '../../Shared/Permissions/Permissions';

import type { PermissionType } from '@linode/api-v4';

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

export const UserRoles = () => {
  const { username } = useParams<{ username: string }>();

  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

  const handleClick = () => {
    // mock for UIE-8140: RBAC-4: User Roles - Assign New Role
  };

  const hasAssignedRoles = assignedRoles ? !isEmpty(assignedRoles) : false;

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Roles`} />
      <Paper>
        <Stack spacing={3}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
          >
            <Typography variant="h2">Assigned Roles</Typography>
            <Button buttonType="primary" onClick={handleClick}>
              Assign New Role
            </Button>
          </Stack>
          {hasAssignedRoles ? (
            <div>
              <p>UIE-8138 - assigned roles table</p>

              {/* just for showing the Permissions componnet, it will be gone with the AssignedPermissions component*/}

              <div
                style={{
                  outline: '1px dashed',
                  paddingLeft: '8px',
                  paddingRight: '10px',
                }}
              >
                <Permissions permissions={mockPermissionsLong} />
              </div>
            </div>
          ) : (
            <NoAssignedRoles text={NO_ASSIGNED_ROLES_TEXT} />
          )}
        </Stack>
      </Paper>
    </>
  );
};
