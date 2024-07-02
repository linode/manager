import { Volume } from '@linode/api-v4';
import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { splitAt } from 'ramda';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

export interface ActionHandlers {
  handleAttach: () => void;
  handleClone: () => void;
  handleDelete: () => void;
  handleDetach: () => void;
  handleDetails: () => void;
  handleEdit: () => void;
  handleResize: () => void;
  handleUpgrade: () => void;
}

export interface Props {
  handlers: ActionHandlers;
  isVolumesLanding: boolean;
  volume: Volume;
}

export const VolumesActionMenu = (props: Props) => {
  const { handlers, isVolumesLanding, volume } = props;

  const attached = volume.linode_id !== null;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const isVolumeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'volume',
    id: volume.id,
  });

  const actions: Action[] = [
    {
      onClick: handlers.handleDetails,
      title: 'Show Config',
    },
    {
      disabled: isVolumeReadOnly,
      onClick: handlers.handleEdit,
      title: 'Edit',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    {
      disabled: isVolumeReadOnly,
      onClick: handlers.handleResize,
      title: 'Resize',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'resize',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    {
      disabled: isVolumeReadOnly,
      onClick: handlers.handleClone,
      title: 'Clone',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'clone',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
  ];

  if (!attached && isVolumesLanding) {
    actions.push({
      disabled: isVolumeReadOnly,
      onClick: handlers.handleAttach,
      title: 'Attach',
      tooltip: isVolumeReadOnly
        ? "You don't have permissions to attach this Volume. \
        Please contact your account administrator to request the necessary permissions."
        : undefined,
    });
  } else {
    actions.push({
      disabled: isVolumeReadOnly,
      onClick: handlers.handleDetach,
      title: 'Detach',
      tooltip: isVolumeReadOnly
        ? "You don't have permissions to detach this Volume. \
        Please contact your account administrator to request the necessary permissions."
        : undefined,
    });
  }

  actions.push({
    disabled: isVolumeReadOnly || attached,
    onClick: handlers.handleDelete,
    title: 'Delete',
    tooltip: isVolumeReadOnly
      ? getRestrictedResourceText({
          action: 'delete',
          isSingular: true,
          resourceType: 'Volumes',
        })
      : attached
      ? 'Your volume must be detached before it can be deleted.'
      : undefined,
  });

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Volume ${volume.label}`}
      />
    </>
  );
};
