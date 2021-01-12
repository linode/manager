import * as React from 'react';
import ActionMenu from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';

interface Props {
  nodeId?: string;
  instanceLabel?: string;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

export const NodeActionMenu: React.FC<Props> = props => {
  const { nodeId, instanceLabel, openRecycleNodeDialog } = props;
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const actions = [
    {
      title: 'Recycle',
      onClick: () => {
        if (!nodeId || !instanceLabel) {
          return;
        }
        openRecycleNodeDialog(nodeId!, instanceLabel!);
      },
      disabled: !nodeId || !instanceLabel
    }
  ];

  return !matchesSmDown ? (
    // eslint-disable-next-line
    <>
      {actions.map(action => {
        return (
          <InlineMenuAction
            key={action.title}
            actionText={action.title}
            onClick={action.onClick}
          />
        );
      })}
    </>
  ) : (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Node ${instanceLabel}`}
    />
  );
};

export default React.memo(NodeActionMenu);
