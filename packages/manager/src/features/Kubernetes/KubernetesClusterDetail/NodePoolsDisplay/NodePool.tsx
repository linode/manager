import {
  AutoscaleSettings,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Button } from 'src/components/Button/Button';
import Grid from '@mui/material/Unstable_Grid2';
import NodeTable from './NodeTable';
import { Tooltip } from 'src/components/Tooltip';

interface Props {
  poolId: number;
  typeLabel: string;
  nodes: PoolNodeResponse[];
  autoscaler: AutoscaleSettings;
  handleClickResize: (poolId: number) => void;
  openAutoscalePoolDialog: (poolId: number) => void;
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  isOnlyNodePool: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    paddingRight: 8,
  },
  autoscaleText: {
    paddingRight: theme.spacing(2),
    alignSelf: 'center',
  },
  deletePoolBtn: {
    paddingRight: 8,
    marginBottom: 3,
  },
}));

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
    isOnlyNodePool,
  } = props;

  const classes = useStyles();

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      data-qa-node-pool-section
      data-qa-node-pool-id={poolId}
    >
      <Grid>
        <Typography variant="h2">{typeLabel}</Typography>
      </Grid>
      <Grid
        sx={{
          display: 'flex',
        }}
      >
        <Button
          className={`${autoscaler.enabled ? classes.button : ''}`}
          buttonType="secondary"
          compactY
          onClick={() => openAutoscalePoolDialog(poolId)}
        >
          Autoscale Pool
        </Button>
        {autoscaler.enabled ? (
          <Typography className={classes.autoscaleText}>
            {`(Min ${autoscaler.min} / Max ${autoscaler.max})`}
          </Typography>
        ) : null}
        <Button
          buttonType="secondary"
          compactY
          onClick={() => handleClickResize(poolId)}
        >
          Resize Pool
        </Button>
        <Button
          buttonType="secondary"
          compactY
          onClick={() => openRecycleAllNodesDialog(poolId)}
        >
          Recycle Pool Nodes
        </Button>
        <Tooltip
          title="Clusters must contain at least one node pool."
          disableFocusListener={!isOnlyNodePool}
          disableHoverListener={!isOnlyNodePool}
          disableTouchListener={!isOnlyNodePool}
        >
          <div>
            <Button
              className={classes.deletePoolBtn}
              buttonType="secondary"
              compactY
              disabled={isOnlyNodePool}
              onClick={() => openDeletePoolDialog(poolId)}
            >
              Delete Pool
            </Button>
          </div>
        </Tooltip>
      </Grid>
      <Grid
        xs={12}
        sx={{
          paddingTop: 0,
        }}
      >
        <NodeTable
          poolId={poolId}
          nodes={nodes}
          typeLabel={typeLabel}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </Grid>
    </Grid>
  );
};

export default NodePool;
