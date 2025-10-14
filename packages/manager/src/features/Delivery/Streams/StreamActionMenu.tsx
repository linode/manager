import { type Stream, streamStatus } from '@linode/api-v4';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

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

  const menuActions = [
    {
      onClick: () => {
        onEdit(stream);
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        onDisableOrEnable(stream);
      },
      title: stream.status === streamStatus.Active ? 'Disable' : 'Enable',
    },
    {
      onClick: () => {
        onDelete(stream);
      },
      title: 'Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={menuActions}
      ariaLabel={`Action menu for Stream ${stream.label}`}
    />
  );
};
