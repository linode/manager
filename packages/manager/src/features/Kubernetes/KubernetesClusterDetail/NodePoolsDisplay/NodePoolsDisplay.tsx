import * as React from 'react';
import { useSelector } from 'react-redux';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { useDialog } from 'src/hooks/useDialog';
import useLinodes from 'src/hooks/useLinodes';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PoolNodeWithPrice } from '../../types';
import ResizeNodePoolDrawer from '../ResizeNodePoolDrawer';
import NodeDialog from './NodeDialog';
import NodePool from './NodePool';
import NodePoolDialog from './NodePoolDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
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
  }
}));

export interface Props {
  pools: PoolNodeWithPrice[];
  types: ExtendedType[];
  updatePool: (
    poolID: number,
    updatedPool: PoolNodeWithPrice
  ) => Promise<PoolNodeWithPrice>;
  deletePool: (poolID: number) => Promise<any>;
}

export const NodePoolsDisplay: React.FC<Props> = props => {
  const { pools, types, updatePool, deletePool } = props;

  const classes = useStyles();

  const { deleteLinode } = useLinodes();

  const deletePoolDialog = useDialog<number>(deletePool);
  const deleteNodeDialog = useDialog<number>(deleteLinode);

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerSubmitting, setDrawerSubmitting] = React.useState<boolean>(
    false
  );
  const [drawerError, setDrawerError] = React.useState<string | undefined>();
  const [poolForEdit, setPoolForEdit] = React.useState<
    PoolNodeWithPrice | undefined
  >();

  const handleOpenResizeDrawer = (poolID: number) => {
    setPoolForEdit(pools.find(thisPool => thisPool.id === poolID));
    setDrawerOpen(true);
    setDrawerError(undefined);
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
        setDrawerOpen(false);
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
    const { dialog, submitDialog, handleError } = deleteNodeDialog;
    if (!dialog.entityID) {
      return;
    }
    submitDialog(dialog.entityID).catch(err => {
      handleError(
        getAPIErrorOrDefault(err, 'Error deleting this Linode.')[0].reason
      );
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
      <Typography variant="h2" className={classes.nodePoolHeader}>
        Node Pools
      </Typography>
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
                      openDeleteNodeDialog={deleteNodeDialog.openDialog}
                    />
                  </div>
                );
              })}
            </Grid>
            <ResizeNodePoolDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
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
              onClose={deleteNodeDialog.closeDialog}
              open={deleteNodeDialog.dialog.isOpen}
              error={deleteNodeDialog.dialog.error}
              loading={deleteNodeDialog.dialog.isLoading}
              label={deleteNodeDialog.dialog.entityLabel}
            />
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default React.memo(NodePoolsDisplay);
