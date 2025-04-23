import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Theme } from '@mui/material/styles';

interface Props {
  instanceLabel?: string;
  nodeId?: string;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

export const NodeActionMenu = (props: Props) => {
  const { instanceLabel, nodeId, openRecycleNodeDialog } = props;
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const actions = [
    {
      disabled: !nodeId || !instanceLabel,
      onClick: () => {
        if (!nodeId || !instanceLabel) {
          return;
        }
        openRecycleNodeDialog(nodeId!, instanceLabel!);
      },
      title: 'Recycle',
    },
  ];

  return (
    <Box alignItems="center" display="flex" justifyContent="flex-end">
      {!matchesSmDown ? (
        actions.map((action) => (
          <InlineMenuAction
            actionText={action.title}
            disabled={action.disabled}
            key={action.title}
            onClick={action.onClick}
          />
        ))
      ) : (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Node ${instanceLabel}`}
        />
      )}
    </Box>
  );
};

export default React.memo(NodeActionMenu);
