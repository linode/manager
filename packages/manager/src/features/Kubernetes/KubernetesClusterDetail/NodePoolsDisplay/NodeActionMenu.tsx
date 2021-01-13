import * as React from 'react';
import ActionMenu from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from 'src/components/core/styles';

interface Props {
  nodeId?: string;
  instanceLabel?: string;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
}));

export const NodeActionMenu: React.FC<Props> = props => {
  const { nodeId, instanceLabel, openRecycleNodeDialog } = props;
  const theme = useTheme<Theme>();
  const classes = useStyles();
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

  return (
    <div className={classes.root}>
      {!matchesSmDown ? (
        actions.map(action => (
          <InlineMenuAction
            key={action.title}
            actionText={action.title}
            onClick={action.onClick}
            disabled={action.disabled}
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
