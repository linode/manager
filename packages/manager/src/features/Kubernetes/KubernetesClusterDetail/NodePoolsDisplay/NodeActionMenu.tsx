import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  instanceId?: number;
  instanceLabel?: string;
  openRecycleNodeDialog: (linodeId: number, linodeLabel: string) => void;
}

export const NodeActionMenu: React.FC<Props> = props => {
  const { instanceId, instanceLabel, openRecycleNodeDialog } = props;

  const createActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Recycle',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            if (!instanceId || !instanceLabel) {
              return;
            }
            openRecycleNodeDialog(instanceId!, instanceLabel!);
            closeMenu();
            e.preventDefault();
          },
          disabled: !instanceId || !instanceLabel
        }
      ];

      return actions;
    };
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Node ${instanceLabel}`}
    />
  );
};

export default React.memo(NodeActionMenu);
