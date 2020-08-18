import * as React from 'react';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  id: number;
  label: string;
  onDelete: (id: number, label: string) => void;
}

type CombinedProps = Props;

export const SSHKeyActionMenu: React.FC<CombinedProps> = props => {
  const { id, label, onDelete } = props;

  return (
    <InlineMenuAction
      key="Delete"
      actionText="Delete"
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        onDelete(id, label);
        e.preventDefault();
      }}
    />
  );
};

export default SSHKeyActionMenu;
