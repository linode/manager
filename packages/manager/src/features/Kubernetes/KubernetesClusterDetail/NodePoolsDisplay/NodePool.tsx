import { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import NodeTable from './NodeTable';

interface Props {
  poolId: number;
  typeLabel: string;
  nodes: PoolNodeResponse[];
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  handleClickResize: (poolId: number) => void;
}

const NodePool: React.FC<Props> = props => {
  const {
    handleClickResize,
    openDeletePoolDialog,
    openRecycleAllNodesDialog,
    openRecycleNodeDialog,
    nodes,
    typeLabel,
    poolId
  } = props;

  return (
    <>
      <Grid
        container
        className="my0"
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <Typography variant="h2">{typeLabel}</Typography>
        </Grid>
        <Grid item>
          <Button
            buttonType="secondary"
            onClick={() => handleClickResize(poolId)}
          >
            Resize Pool
          </Button>
          <Button
            buttonType="secondary"
            onClick={() => openRecycleAllNodesDialog(poolId)}
          >
            Recycle Nodes
          </Button>
          <Button
            buttonType="secondary"
            onClick={() => openDeletePoolDialog(poolId)}
          >
            Delete Pool
          </Button>
        </Grid>
      </Grid>
      <NodeTable
        poolId={poolId}
        nodes={nodes}
        typeLabel={typeLabel}
        openRecycleNodeDialog={openRecycleNodeDialog}
      />
    </>
  );
};

export default NodePool;
