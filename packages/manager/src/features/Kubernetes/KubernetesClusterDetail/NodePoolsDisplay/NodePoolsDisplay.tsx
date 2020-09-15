import {
  PoolNodeRequest,
  PoolNodeResponse
} from '@linode/api-v4/lib/kubernetes/types';
import classnames from 'classnames';
import * as React from 'react';
import { useSelector } from 'react-redux';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { useDialog } from 'src/hooks/useDialog';
import useFlags from 'src/hooks/useFlags';
import useLinodes from 'src/hooks/useLinodes';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PoolNodeWithPrice } from '../../types';
import AddNodePoolDrawer from '../AddNodePoolDrawer';
import ResizeNodePoolDrawer from '../ResizeNodePoolDrawer';
import NodeDialog from './NodeDialog';
import NodePool from './NodePool';
import NodePoolDialog from './NodePoolDialog';
import RecycleAllNodesDialog from './RecycleAllNodesDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    paddingTop: '4px'
  },
  addNodePoolLink: {
    display: 'flex',
    alignItems: 'flex-end',
    '& button': {
      marginButton: 0,
      paddingBottom: theme.spacing()
    }
  },
  displayTable: {
    width: '100%',
    '& > div': {
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(4)
    },
    '& > div:last-child': {
      marginBottom: 0
    }
  },
  nodePoolHeader: {
    marginBottom: theme.spacing()
  },
  nodePoolHeaderOuter: {
    display: 'flex',
    alignItems: 'center'
  },
  nodePool: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(4)
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing()
    }
  }
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
  recycleAllNodes: (poolID: number) => Promise<any>;
}

export const NodePoolsDisplay: React.FC<Props> = props => {
  const {
    clusterLabel,
    pools,
    types,
    addNodePool,
    updatePool,
    deletePool,
    recycleAllNodes
  } = props;

  const classes = useStyles();
  const flags = useFlags();

  const { deleteLinode } = useLinodes();

  const deletePoolDialog = useDialog<number>(deletePool);
  const recycleAllNodesDialog = useDialog<number>(recycleAllNodes);
  const recycleNodeDialog = useDialog<number>(deleteLinode);

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
    setPoolForEdit(pools.find(thisPool => thisPool.id === poolID));
    setResizeDrawerOpen(true);
    setDrawerError(undefined);
  };

  const handleAdd = (type: string, count: number) => {
    setDrawerSubmitting(true);
    setDrawerError(undefined);
    return addNodePool({ type, count })
      .then(_ => {
        setDrawerSubmitting(false);
        setAddDrawerOpen(false);
      })
      .catch(error => {
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
      .then(_ => {
        setDrawerSubmitting(false);
        setResizeDrawerOpen(false);
      })
      .catch(error => {
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
    submitDialog(dialog.entityID).catch(err => {
      handleError(
        getAPIErrorOrDefault(err, 'Error deleting this Node Pool.')[0].reason
      );
    });
  };

  const handleDeleteNode = () => {
    const { dialog, submitDialog, handleError } = recycleNodeDialog;
    if (!dialog.entityID) {
      return;
    }
    submitDialog(dialog.entityID).catch(err => {
      handleError(
        getAPIErrorOrDefault(err, 'Error deleting this Linode.')[0].reason
      );
    });
  };

  const handleRecycleAllNodes = () => {
    const { dialog, submitDialog, handleError } = recycleAllNodesDialog;
    if (!dialog.entityID) {
      return;
    }
    return submitDialog(dialog.entityID).catch(err => {
      handleError(getAPIErrorOrDefault(err, 'Error recycling nodes')[0].reason);
    });
  };

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
        justify="space-between"
        alignItems="flex-end"
        updateFor={[classes]}
        style={{ paddingBottom: 0 }}
      >
        <Grid item>
          <Typography
            variant="h2"
            className={classnames({
              [classes.nodePoolHeader]: true,
              [classes.cmrSpacing]: flags.cmr
            })}
          >
            Node Pools
          </Typography>
        </Grid>
        <Grid item>
          <div
            className={classnames({
              [classes.addNodePoolLink]: true,
              [classes.cmrSpacing]: flags.cmr
            })}
          >
            <AddNewLink
              onClick={() => {
                handleOpenAddDrawer();
              }}
              label="Add a Node Pool"
            />
          </div>
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        {poolsError ? (
          <ErrorState errorText={poolsError} />
        ) : (
          <Grid container direction="column">
            <Grid item xs={12} className={classes.displayTable}>
              {pools.map(thisPool => {
                const { id, nodes } = thisPool;

                const thisPoolType = types.find(
                  thisType => thisType.id === thisPool.type
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
                        recycleAllNodesDialog.openDialog
                      }
                      openRecycleNodeDialog={recycleNodeDialog.openDialog}
                    />
                  </div>
                );
              })}
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
                  thisPool => thisPool.id === deletePoolDialog.dialog.entityID
                )?.count ?? 0
              }
              onDelete={handleDeletePool}
              onClose={deletePoolDialog.closeDialog}
              open={deletePoolDialog.dialog.isOpen}
              error={deletePoolDialog.dialog.error}
              loading={deletePoolDialog.dialog.isLoading}
            />
            <NodeDialog
              onDelete={handleDeleteNode}
              onClose={recycleNodeDialog.closeDialog}
              open={recycleNodeDialog.dialog.isOpen}
              error={recycleNodeDialog.dialog.error}
              loading={recycleNodeDialog.dialog.isLoading}
              label={recycleNodeDialog.dialog.entityLabel}
            />
            <RecycleAllNodesDialog
              open={recycleAllNodesDialog.dialog.isOpen}
              loading={recycleAllNodesDialog.dialog.isLoading}
              error={recycleAllNodesDialog.dialog.error}
              onClose={recycleAllNodesDialog.closeDialog}
              onSubmit={handleRecycleAllNodes}
            />
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default React.memo(NodePoolsDisplay);
