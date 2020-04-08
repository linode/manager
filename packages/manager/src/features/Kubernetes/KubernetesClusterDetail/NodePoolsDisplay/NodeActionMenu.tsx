import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  instanceId?: number;
  instanceLabel?: string;
  openDeleteNodeDialog: (linodeId: number, linodeLabel: string) => void;
}

export const NodeActionMenu: React.FC<Props> = props => {
  const { instanceId, instanceLabel, openDeleteNodeDialog } = props;

  const createActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            // Defaults for TS, but this option will be disabled anyway in that case.
            openDeleteNodeDialog(instanceId ?? 0, instanceLabel ?? '');
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
