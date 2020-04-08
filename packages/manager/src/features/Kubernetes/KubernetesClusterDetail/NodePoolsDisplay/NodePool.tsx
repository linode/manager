import { PoolNodeResponse } from 'linode-js-sdk/lib/kubernetes';
import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import NodeTable from './NodeTable';

const useStyles = makeStyles((theme: Theme) => ({
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
  openDeleteDialog: (poolId: number) => void;
  handleClickResize: (poolId: number) => void;
  // Not yet supported by the API:
  // recycleNodes: (poolId: number) => void;
}

const NodePool: React.FC<Props> = props => {
  const {
    handleClickResize,
    openDeleteDialog,
    nodes,
    typeLabel,
    poolId
  } = props;

  const classes = useStyles();

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">{typeLabel}</Typography>
        {/* @todo: Real buttons that do real things. You can ignore this bit for now.*/}
        <div>
          <Button onClick={() => handleClickResize(poolId)}>Resize Pool</Button>
          {/* <span className={classes.button}>Recycle All Nodes</span> (not ready yet) */}
          <Button onClick={() => openDeleteDialog(poolId)}>Delete Pool</Button>
        </div>
      </Box>
      <div className={classes.nodeTable}>
        <NodeTable poolId={poolId} nodes={nodes} typeLabel={typeLabel} />
      </div>
    </>
  );
};

export default NodePool;
