import {
  PoolNodeRequest,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { useDialog } from 'src/hooks/useDialog';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PoolNodeWithPrice } from '../../types';
import RecycleAllClusterNodesDialog from '../RecycleAllClusterNodesDialog';
import AddNodePoolDrawer from '../AddNodePoolDrawer';
import ResizeNodePoolDrawer from '../ResizeNodePoolDrawer';
import NodeDialog from './NodeDialog';
import NodePool from './NodePool';
import NodePoolDialog from './NodePoolDialog';
import RecycleAllPoolNodesDialog from './RecycleAllPoolNodesDialog';
import Button from 'src/components/Button';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    paddingTop: '4px',
  },
  button: {
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  displayTable: {
    width: '100%',
    '& > div': {
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(4),
    },
    '& > div:last-child': {
      marginBottom: 0,
    },
  },
  nodePoolHeader: {
    marginBottom: theme.spacing(),
  },
  nodePoolHeaderOuter: {
    display: 'flex',
    alignItems: 'center',
  },
  nodePool: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(4),
  },
  mobileSpacing: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
}));

export interface Props {
  clusterLabel: string;
  pools: PoolNodeWithPrice[];
  types: ExtendedType[];
  updatePool: (
    poolID: number,
    updatedPool: PoolNodeWithPrice
  ) => Promise<PoolNodeWithPrice>;
  deletePool: (poolID: number) => Promise<any>;
  addNodePool: (newPool: PoolNodeRequest) => Promise<PoolNodeResponse>;
  recycleAllClusterNodes: () => Promise<{}>;
  recycleAllPoolNodes: (poolID: number) => Promise<{}>;
  recycleNode: (nodeID: string) => Promise<{}>;
}

export const NodePoolsDisplay: React.FC<Props> = (props) => {
  const {
    clusterLabel,
    pools,
    types,
    addNodePool,
    updatePool,
    deletePool,
    recycleAllClusterNodes,
    recycleAllPoolNodes,
    recycleNode,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const deletePoolDialog = useDialog<number>(deletePool);
  const recycleAllPoolNodesDialog = useDialog<number>(recycleAllPoolNodes);
  const recycleAllClusterNodesDialog = useDialog(recycleAllClusterNodes);
  const recycleNodeDialog = useDialog<string>(recycleNode);

  const [numPoolsToDisplay, setNumPoolsToDisplay] = React.useState(25);
  const handleShowMore = () => {
    if (numPoolsToDisplay < pools.length) {
      setNumPoolsToDisplay(Math.min(numPoolsToDisplay + 25, pools.length));
    }
  };

  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);
  const [resizeDrawerOpen, setResizeDrawerOpen] = React.useState<boolean>(
    false
  );
  const [drawerSubmitting, setDrawerSubmitting] = React.useState<boolean>(
    false
  );
  const [drawerError, setDrawerError] = React.useState<string | undefined>();
  const [poolForEdit, setPoolForEdit] = React.useState<
    PoolNodeWithPrice | undefined
  >();

  const handleOpenAddDrawer = () => {
    setAddDrawerOpen(true);
    setDrawerError(undefined);
  };

  const handleOpenResizeDrawer = (poolID: number) => {
    setPoolForEdit(pools.find((thisPool) => thisPool.id === poolID));
    setResizeDrawerOpen(true);
    setDrawerError(undefined);
  };

  const handleAdd = (type: string, count: number) => {
    setDrawerSubmitting(true);
    setDrawerError(undefined);
    return addNodePool({ type, count })
      .then((_) => {
        setDrawerSubmitting(false);
        setAddDrawerOpen(false);
      })
      .catch((error) => {
        setDrawerSubmitting(false);
        setDrawerError(
          getAPIErrorOrDefault(error, 'Error adding Node Pool')[0].reason
        );
      });
  };

  const handleResize = (updatedCount: number) => {
    // Should never happen, just a safety check
    if (!poolForEdit) {
      return;
    }
    setDrawerSubmitting(true);
    setDrawerError(undefined);
    updatePool(poolForEdit.id, { ...poolForEdit, count: updatedCount })
      .then((_) => {
        setDrawerSubmitting(false);
        setResizeDrawerOpen(false);
      })
      .catch((error) => {
        setDrawerSubmitting(false);
        setDrawerError(
          getAPIErrorOrDefault(error, 'Error resizing Node Pool')[0].reason
        );
      });
  };

  const handleDeletePool = () => {
    const { dialog, submitDialog, handleError } = deletePoolDialog;
    if (!dialog.entityID) {
      return;
    }
    submitDialog(dialog.entityID).catch((err) => {
      handleError(
        getAPIErrorOrDefault(err, 'Error deleting this Node Pool.')[0].reason
      );
    });
  };

  const handleRecycleNode = () => {
    const { dialog, submitDialog, handleError } = recycleNodeDialog;
    if (!dialog.entityID) {
      return;
    }
    submitDialog(dialog.entityID)
      .then((_) => {
        enqueueSnackbar('Node queued for recycling.', { variant: 'success' });
      })
      .catch((err) => {
        handleError(
          getAPIErrorOrDefault(err, 'Error recycling this node.')[0].reason
        );
      });
  };

  const handleRecycleAllPoolNodes = () => {
    const { dialog, submitDialog, handleError } = recycleAllPoolNodesDialog;
    if (!dialog.entityID) {
      return;
    }
    return submitDialog(dialog.entityID).catch((err) => {
      handleError(getAPIErrorOrDefault(err, 'Error recycling nodes')[0].reason);
    });
  };

  const handleRecycleAllClusterNodes = () => {
    recycleAllClusterNodesDialog
      .submitDialog(undefined)
      .then((_) =>
        enqueueSnackbar('Nodes queued for recycling', { variant: 'success' })
      );
  };

  const _pools = pools.slice(0, numPoolsToDisplay);

  /**
   * If the API returns an error when fetching node pools,
   * we want to display this error to the user from the
   * NodePoolDisplayTable.
   *
   * Only do this if we haven't yet successfully retrieved this
   * data, so a random error in our subsequent polling doesn't
   * break the view.
   */
  const poolsError = useSelector((state: ApplicationState) => {
    const error = state.__resources.nodePools?.error?.read;
    const lastUpdated = state.__resources.nodePools.lastUpdated;
    if (error && lastUpdated === 0) {
      return getAPIErrorOrDefault(error, 'Unable to load Node Pools.')[0]
        .reason;
    }
    return undefined;
  });

  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        updateFor={[classes]}
      >
        <Grid item>
          <Typography
            variant="h2"
            className={`${classes.nodePoolHeader} ${classes.mobileSpacing}`}
          >
            Node Pools
          </Typography>
        </Grid>
        <Grid item>
          <Button
            buttonType="secondary"
            className={`${classes.button} ${classes.mobileSpacing}`}
            onClick={() => recycleAllClusterNodesDialog.openDialog(undefined)}
          >
            Recycle All Nodes
          </Button>
          <Button
            buttonType="primary"
            className={`${classes.button} ${classes.mobileSpacing}`}
            onClick={handleOpenAddDrawer}
          >
            Add a Node Pool
          </Button>
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        {poolsError ? (
          <ErrorState errorText={poolsError} />
        ) : (
          <Grid container direction="column">
            <Grid item xs={12} className={classes.displayTable}>
              {_pools.map((thisPool) => {
                const { id, nodes } = thisPool;

                const thisPoolType = types.find(
                  (thisType) => thisType.id === thisPool.type
                );

                const typeLabel = thisPoolType?.label ?? 'Unknown type';

                return (
                  <div key={id} className={classes.nodePool}>
                    <NodePool
                      poolId={thisPool.id}
                      typeLabel={typeLabel}
                      nodes={nodes ?? []}
                      handleClickResize={handleOpenResizeDrawer}
                      openDeletePoolDialog={deletePoolDialog.openDialog}
                      openRecycleAllNodesDialog={
                        recycleAllPoolNodesDialog.openDialog
                      }
                      openRecycleNodeDialog={recycleNodeDialog.openDialog}
                    />
                  </div>
                );
              })}
              {pools.length > numPoolsToDisplay && (
                <Waypoint onEnter={handleShowMore} scrollableAncestor="window">
                  <div style={{ minHeight: 50 }} />
                </Waypoint>
              )}
            </Grid>

            <AddNodePoolDrawer
              clusterLabel={clusterLabel}
              open={addDrawerOpen}
              onClose={() => setAddDrawerOpen(false)}
              onSubmit={handleAdd}
              isSubmitting={drawerSubmitting}
              error={drawerError}
            />
            <ResizeNodePoolDrawer
              open={resizeDrawerOpen}
              onClose={() => setResizeDrawerOpen(false)}
              onSubmit={(updatedCount: number) => handleResize(updatedCount)}
              nodePool={poolForEdit}
              isSubmitting={drawerSubmitting}
              error={drawerError}
            />
            <NodePoolDialog
              nodeCount={
                pools.find(
                  (thisPool) => thisPool.id === deletePoolDialog.dialog.entityID
                )?.count ?? 0
              }
              onDelete={handleDeletePool}
              onClose={deletePoolDialog.closeDialog}
              open={deletePoolDialog.dialog.isOpen}
              error={deletePoolDialog.dialog.error}
              loading={deletePoolDialog.dialog.isLoading}
            />
            <NodeDialog
              onDelete={handleRecycleNode}
              onClose={recycleNodeDialog.closeDialog}
              open={recycleNodeDialog.dialog.isOpen}
              error={recycleNodeDialog.dialog.error}
              loading={recycleNodeDialog.dialog.isLoading}
              label={recycleNodeDialog.dialog.entityLabel}
            />
            <RecycleAllPoolNodesDialog
              open={recycleAllPoolNodesDialog.dialog.isOpen}
              loading={recycleAllPoolNodesDialog.dialog.isLoading}
              error={recycleAllPoolNodesDialog.dialog.error}
              onClose={recycleAllPoolNodesDialog.closeDialog}
              onSubmit={handleRecycleAllPoolNodes}
            />
            <RecycleAllClusterNodesDialog
              open={recycleAllClusterNodesDialog.dialog.isOpen}
              loading={recycleAllClusterNodesDialog.dialog.isLoading}
              error={recycleAllClusterNodesDialog.dialog.error}
              onClose={recycleAllClusterNodesDialog.closeDialog}
              onSubmit={handleRecycleAllClusterNodes}
            />
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default React.memo(NodePoolsDisplay);
