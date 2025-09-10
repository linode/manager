import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { PermissionType } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type PermissionsSubset<T extends PermissionType> = T;
type OAuthClientPermissions = PermissionsSubset<
  'delete_oauth_client' | 'reset_oauth_client_secret' | 'update_oauth_client'
>;

interface Props {
  label: string;
  onOpenDeleteDialog: () => void;
  onOpenEditDrawer: () => void;
  onOpenResetDialog: () => void;
  permissions: Record<OAuthClientPermissions, boolean>;
}

export const OAuthClientActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { permissions, label } = props;

  const actions: Action[] = [
    {
      onClick: props.onOpenEditDrawer,
      title: 'Edit',
      disabled: !permissions.update_oauth_client,
    },
    {
      onClick: props.onOpenResetDialog,
      title: 'Reset',
      disabled: !permissions.reset_oauth_client_secret,
    },
    {
      onClick: props.onOpenDeleteDialog,
      title: 'Delete',
      disabled: !permissions.delete_oauth_client,
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for OAuth Client ${label}`}
        />
      ) : (
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default OAuthClientActionMenu;
