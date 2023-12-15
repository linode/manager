import {
  AutoscaleSettings,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';

import NodeTable from './NodeTable';

interface Props {
  autoscaler: AutoscaleSettings;
  handleClickResize: (poolId: number) => void;
  isOnlyNodePool: boolean;
  nodes: PoolNodeResponse[];
  openAutoscalePoolDialog: (poolId: number) => void;
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  typeLabel: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  autoscaleText: {
    alignSelf: 'center',
    paddingRight: theme.spacing(2),
  },
  button: {
    paddingRight: 8,
  },
  deletePoolBtn: {
    marginBottom: 3,
    paddingRight: 8,
  },
}));

const NodePool: React.FC<Props> = (props) => {
  const {
    autoscaler,
    handleClickResize,
    isOnlyNodePool,
    nodes,
    openAutoscalePoolDialog,
    openDeletePoolDialog,
    openRecycleAllNodesDialog,
    openRecycleNodeDialog,
    poolId,
    typeLabel,
  } = props;

  const { classes } = useStyles();

  return (
    <Grid
      alignItems="center"
      container
      data-qa-node-pool-id={poolId}
      data-qa-node-pool-section
      justifyContent="space-between"
      spacing={2}
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
          buttonType="secondary"
          className={`${autoscaler.enabled ? classes.button : ''}`}
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
          disableFocusListener={!isOnlyNodePool}
          disableHoverListener={!isOnlyNodePool}
          disableTouchListener={!isOnlyNodePool}
          title="Clusters must contain at least one node pool."
        >
          <div>
            <Button
              buttonType="secondary"
              className={classes.deletePoolBtn}
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
        sx={{
          paddingTop: 0,
        }}
        xs={12}
      >
        <NodeTable
          nodes={nodes}
          openRecycleNodeDialog={openRecycleNodeDialog}
          poolId={poolId}
          typeLabel={typeLabel}
        />
      </Grid>
    </Grid>
  );
};

export default NodePool;
