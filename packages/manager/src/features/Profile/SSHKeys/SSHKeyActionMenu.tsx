import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  onDelete: () => void;
  onEdit: () => void;
}

export const SSHKeyActionMenu = (props: Props) => {
  const { onDelete, onEdit } = props;

  return (
    <>
      <InlineMenuAction actionText="Edit" onClick={onEdit} />
      <InlineMenuAction actionText="Delete" onClick={onDelete} />
    </>
  );
};
