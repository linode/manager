import {
  AutoscaleNodePool,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import NodeTable from './NodeTable';
import Tooltip from 'src/components/core/Tooltip';

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
  isOnlyNodePool: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  slash: {
    alignSelf: 'end',
    padding: '0px !important',
    '& p': {
      fontSize: '1rem',
      padding: `${theme.spacing(2)}px 0`,
    },
  },
  button: {
    paddingRight: 8,
  },
  autoscaleText: {
    paddingRight: theme.spacing(2),
    alignSelf: 'center',
  },
  deletePoolBtn: {
    paddingRight: 0,
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
    <>
      <Grid
        container
        className="my0"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item>
          <Typography variant="h2">{typeLabel}</Typography>
        </Grid>
        <Grid item style={{ display: 'flex' }}>
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
