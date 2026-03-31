import { type Stream, streamStatus } from '@linode/api-v4';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface StreamHandlers {
  onDelete: (stream: Stream) => void;
  onDisableOrEnable: (stream: Stream) => void;
  onEdit: (stream: Stream) => void;
}

interface StreamActionMenuProps extends StreamHandlers {
  stream: Stream;
}

export const StreamActionMenu = (props: StreamActionMenuProps) => {
  const { stream, onDelete, onDisableOrEnable, onEdit } = props;
  const { status, label } = stream;

  const menuActions: Action[] = [
    {
      onClick: () => {
        onEdit(stream);
      },
      title: 'Edit',
      pendoId: 'Logs Delivery Streams-Edit',
      disabled:
        status === streamStatus.Deactivating || status === streamStatus.Failed,
    },
    {
      onClick: () => {
        onDisableOrEnable(stream);
      },
      title: status === streamStatus.Active ? 'Deactivate' : 'Activate',
      pendoId: `Logs Delivery Streams-${status === streamStatus.Active ? 'Deactivate' : 'Activate'}`,
      disabled:
        status === streamStatus.Deactivating ||
        status === streamStatus.Failed ||
        status === streamStatus.Provisioning,
    },
    {
      onClick: () => {
        onDelete(stream);
      },
      title: 'Delete',
      pendoId: 'Logs Delivery Streams-Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={menuActions}
      ariaLabel={`Action menu for Stream ${label}`}
      pendoId="Logs Delivery Streams-Action Menu"
    />
  );
};
