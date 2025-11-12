import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Volume } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface ActionHandlers {
  handleAttach: () => void;
  handleClone: () => void;
  handleDelete: () => void;
  handleDetach: () => void;
  handleDetails: () => void;
  handleEdit: () => void;
  handleManageTags: () => void;
  handleResize: () => void;
  handleUpgrade: () => void;
}

export interface Props {
  handlers: ActionHandlers;
  isVolumeDetails?: boolean;
  isVolumesLanding: boolean;
  volume: Volume;
}

export const VolumesActionMenu = (props: Props) => {
  const { handlers, isVolumesLanding, isVolumeDetails, volume } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const isAttached = volume.linode_id !== null;

  const { data: accountPermissions } = usePermissions('account', [
    'is_account_admin',
  ]);
  const { data: volumePermissions, isLoading } = usePermissions(
    'volume',
    [
      'delete_volume',
      'view_volume',
      'resize_volume',
      'clone_volume',
      'attach_volume',
      'detach_volume',
      'update_volume',
    ],
    volume.id,
    isOpen
  );

  const { data: linodePermissions } = usePermissions(
    'linode',
    ['delete_linode'],
    volume.linode_id!,
    isOpen && isAttached
  );

  const ACTIONS = {
    SHOW_CONFIG: {
      onClick: handlers.handleDetails,
      title: 'Show Config',
    },
    EDIT: {
      disabled: !volumePermissions?.update_volume,
      onClick: handlers.handleEdit,
      title: 'Edit',
      tooltip: !volumePermissions?.update_volume
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    MANAGE_TAGS: {
      disabled: !accountPermissions?.is_account_admin,
      onClick: handlers.handleManageTags,
      title: 'Manage Tags',
      tooltip: !accountPermissions?.is_account_admin
        ? "You don't have permissions to manage tags. Please contact an account administrator for details."
        : undefined,
    },
    RESIZE: {
      disabled: !volumePermissions?.resize_volume,
      onClick: handlers.handleResize,
      title: 'Resize',
      tooltip: !volumePermissions?.resize_volume
        ? getRestrictedResourceText({
            action: 'resize',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    CLONE: {
      disabled: !volumePermissions?.clone_volume,
      onClick: handlers.handleClone,
      title: 'Clone',
      tooltip: !volumePermissions?.clone_volume
        ? getRestrictedResourceText({
            action: 'clone',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    ATTACH: {
      disabled: !volumePermissions?.attach_volume,
      onClick: handlers.handleAttach,
      title: 'Attach',
      tooltip: !volumePermissions?.attach_volume
        ? getRestrictedResourceText({
            action: 'attach',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    DETACH: {
      disabled: !(
        volumePermissions?.detach_volume && linodePermissions?.delete_linode
      ),
      onClick: handlers.handleDetach,
      title: 'Detach',
      tooltip: !(
        volumePermissions?.detach_volume && linodePermissions?.delete_linode
      )
        ? getRestrictedResourceText({
            action: 'detach',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    DELETE: {
      disabled: !volumePermissions?.delete_volume || isAttached,
      onClick: handlers.handleDelete,
      title: 'Delete',
      tooltip: !volumePermissions?.delete_volume
        ? getRestrictedResourceText({
            action: 'delete',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : isAttached
          ? 'Your volume must be detached before it can be deleted.'
          : undefined,
    },
  };

  const actions: Action[] = [];

  if (!isVolumeDetails) {
    actions.push(
      ACTIONS.SHOW_CONFIG,
      ACTIONS.EDIT,
      ACTIONS.MANAGE_TAGS,
      ACTIONS.RESIZE
    );
  }

  actions.push(ACTIONS.CLONE);

  const inlineActions: Action[] = [ACTIONS.SHOW_CONFIG, ACTIONS.RESIZE];

  if (!isAttached && isVolumesLanding) {
    actions.push(ACTIONS.ATTACH);
  } else {
    actions.push(ACTIONS.DETACH);
  }

  actions.push(ACTIONS.DELETE);

  return (
    <div>
      {isVolumeDetails &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      <ActionMenu
        actionsList={actions}
        ariaLabel={`Action menu for Volume ${volume.label}`}
        loading={isLoading}
        onOpen={() => {
          setIsOpen(true);
        }}
      />
    </div>
  );
};
