import { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import NodeTable from './NodeTable';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& button': {
      paddingRight: theme.spacing(2.5),
      paddingLeft: theme.spacing(2.5)
    }
  },
  nodeTable: {
    marginTop: theme.spacing(0.5)
  }
}));

interface Props {
  poolId: number;
  typeLabel: string;
  nodes: PoolNodeResponse[];
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (linodeId: number, linodeLabel: string) => void;
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

  const classes = useStyles();

  return (
    <>
      <div className={classes.container}>
        <Typography variant="h2">{typeLabel}</Typography>
        <div className={classes.container}>
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
        </div>
      </div>
      <div className={classes.nodeTable}>
        <NodeTable
          poolId={poolId}
          nodes={nodes}
          typeLabel={typeLabel}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </div>
    </>
  );
};

export default NodePool;
