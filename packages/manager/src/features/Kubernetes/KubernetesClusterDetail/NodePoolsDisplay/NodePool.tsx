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
  typeLabel: string;
  nodes: PoolNodeResponse[];
  poolId: number;
  deletePool: (poolId: number) => void;
  handleClickResize: (poolId: number) => void;
  // Not yet supported by the API:
  // recycleNodes: (poolId: number) => void;
}

type CombinedProps = Props;

const NodePool: React.FC<CombinedProps> = props => {
  const { nodes, typeLabel, poolId } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">{typeLabel}</Typography>
        {/* @todo: Real buttons that do real things. */}
        <div>
          <span className={classes.button}>Resize Pool</span>
          <span className={classes.button}>Recycle All Nodes</span>
          <span className={classes.button}>Delete Pool</span>
        </div>
      </Box>
      <div className={classes.nodeTable}>
        <NodeTable nodes={nodes} poolId={poolId} />
      </div>
    </div>
  );
};

export default NodePool;
