import { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import * as React from 'react';
import Collapse from 'src/assets/icons/collapse.svg';
import Recycle from 'src/assets/icons/recycle.svg';
import Resize from 'src/assets/icons/resize.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import IconTextLink from 'src/components/IconTextLink';
import NodeTable from './NodeTable';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    padding: theme.spacing()
  },
  nodeTable: {
    marginTop: theme.spacing(0.5)
  },
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
  icon: {
    '& svg': {
      marginRight: theme.spacing()
    },
    '& span': {
      top: 0
    }
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
          <IconTextLink
            text="Resize Pool"
            SideIcon={Resize}
            title="Resize Pool"
            onClick={() => handleClickResize(poolId)}
            className={classes.icon}
          />
          <IconTextLink
            text="Recycle Nodes"
            SideIcon={Recycle}
            title="Recycle Nodes"
            onClick={() => openRecycleAllNodesDialog(poolId)}
          />
          <IconTextLink
            text="Delete Pool"
            SideIcon={Collapse}
            title="Delete Pool"
            onClick={() => openDeletePoolDialog(poolId)}
            className={classes.icon}
          />
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
