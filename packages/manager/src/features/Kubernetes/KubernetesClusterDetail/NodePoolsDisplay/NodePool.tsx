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

const useStyles = makeStyles((theme: Theme) => ({
  slash: {
    alignSelf: 'end',
    padding: '0px !important',
    '& p': {
      fontSize: '1rem',
      padding: `${theme.spacing(2)}px 0`,
    },
  },
  container: {
    display: 'flex',
  },
  button: {
    paddingRight: 8,
  },
  text: {
    alignSelf: 'center',
    paddingRight: 16,
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
  } = props;

  const classes = useStyles();
  const flags = useFlags();

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
        <Grid item className={classes.container}>
          {flags.autoscaler ? (
            <div className={classes.container}>
              <Button
                className={`${autoscaler.enabled ? classes.button : ''}`}
                buttonType="secondary"
                onClick={() => openAutoscalePoolDialog(poolId)}
              >
                Autoscale Pool
              </Button>
              {autoscaler.enabled ? (
                <Typography className={classes.text}>
                  {`(Min ${autoscaler.min} / Max ${autoscaler.max})`}
                </Typography>
              ) : null}
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
