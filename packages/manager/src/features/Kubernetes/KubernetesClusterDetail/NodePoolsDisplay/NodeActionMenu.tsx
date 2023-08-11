import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeStyles, useTheme } from '@mui/styles';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  instanceLabel?: string;
  nodeId?: string;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

const useStyles = makeStyles(() => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

export const NodeActionMenu: React.FC<Props> = (props) => {
  const { instanceLabel, nodeId, openRecycleNodeDialog } = props;
  const theme = useTheme<Theme>();
  const classes = useStyles();
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
    <div className={classes.root}>
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
    </div>
  );
};

export default React.memo(NodeActionMenu);
