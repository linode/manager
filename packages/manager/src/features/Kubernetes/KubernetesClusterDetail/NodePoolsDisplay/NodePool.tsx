import { PoolNodeResponse } from 'linode-js-sdk/lib/kubernetes';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import NodeTable from './NodeTable';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(4)
  },
  button: {
    padding: theme.spacing()
  },
  nodeTable: {
    marginTop: theme.spacing(2)
  }
}));

interface Props {
  poolId: number;
  typeLabel: string;
  nodes: PoolNodeResponse[];
  // @todo: real handlers
  // deletePool: (poolId: number) => void;
  // handleClickResize: (poolId: number) => void;
  // Not yet supported by the API:
  // recycleNodes: (poolId: number) => void;
}

const NodePool: React.FC<Props> = props => {
  const { nodes, typeLabel, poolId } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">{typeLabel}</Typography>
        {/* @todo: Real buttons that do real things. You can ignore this bit for now.*/}
        <div>
          <span className={classes.button}>Resize Pool</span>
          <span className={classes.button}>Recycle All Nodes</span>
          <span className={classes.button}>Delete Pool</span>
        </div>
      </Box>
      <div className={classes.nodeTable}>
        <NodeTable poolId={poolId} nodes={nodes} />
      </div>
    </div>
  );
};

export default NodePool;
