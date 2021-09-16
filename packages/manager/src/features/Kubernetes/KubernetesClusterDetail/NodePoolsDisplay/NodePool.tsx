import {
  AutoscaleNodePool,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import NodeTable from './NodeTable';
import useFlags from 'src/hooks/useFlags';

interface Props {
  poolId: number;
  typeLabel: string;
  nodes: PoolNodeResponse[];
  autoscaler: AutoscaleNodePool;
  handleClickResize: (poolId: number) => void;
  openAutoscalePoolDialog: (poolId: number) => void;
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

const NodePool: React.FC<Props> = (props) => {
  const {
    autoscaler,
    handleClickResize,
    openAutoscalePoolDialog,
    openDeletePoolDialog,
    openRecycleAllNodesDialog,
    openRecycleNodeDialog,
    nodes,
    typeLabel,
    poolId,
  } = props;

  const flags = useFlags();

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
        <Grid item style={{ display: 'flex' }}>
          {flags.autoscaler ? (
            <div style={{ display: 'flex' }}>
              <Button
                style={{ paddingRight: 10 }}
                buttonType="secondary"
                onClick={() => openAutoscalePoolDialog(poolId)}
              >
                Autoscale Pool
              </Button>
              <Typography style={{ alignSelf: 'center', paddingRight: 16 }}>
                {`(Min ${autoscaler.min} / Max ${autoscaler.max})`}
              </Typography>
            </div>
          ) : null}
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
            Recycle Pool Nodes
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
