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

  const menuActions: Action[] = [
    {
      onClick: () => {
        onEdit(stream);
      },
      title: 'Edit',
      pendoId: 'Logs Delivery Streams-Edit',
    },
    {
      onClick: () => {
        onDisableOrEnable(stream);
      },
      title: stream.status === streamStatus.Active ? 'Deactivate' : 'Activate',
      pendoId: `Logs Delivery Streams-${stream.status === streamStatus.Active ? 'Deactivate' : 'Activate'}`,
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
      ariaLabel={`Action menu for Stream ${stream.label}`}
      pendoId="Logs Delivery Streams-Action Menu"
    />
  );
};
