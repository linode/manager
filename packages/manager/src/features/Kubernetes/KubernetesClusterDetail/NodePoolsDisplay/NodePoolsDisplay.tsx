import * as React from 'react';
import { useSelector } from 'react-redux';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PoolNodeWithPrice } from '../../types';
import ResizeNodePoolDrawer from '../ResizeNodePoolDrawer';
import NodePool from './NodePool';

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
}

export const NodePoolsDisplay: React.FC<Props> = props => {
  const { pools, types, updatePool } = props;

  const classes = useStyles();

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
                      // @todo: real handlers
                      // deletePool={() => null}
                      handleClickResize={handleOpenResizeDrawer}
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
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default React.memo(NodePoolsDisplay);
