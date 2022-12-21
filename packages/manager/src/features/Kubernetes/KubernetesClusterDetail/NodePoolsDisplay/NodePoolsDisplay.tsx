import {
  autoscaleNodePool,
  AutoscaleNodePool as AutoscaleNodePoolValues,
} from '@linode/api-v4/lib/kubernetes';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { useDialog } from 'src/hooks/useDialog';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { RecycleNodePoolDialog } from '../RecycleNodePoolDialog';
import { AddNodePoolDrawer } from './AddNodePoolDrawer';
import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';
import { RecycleNodeDialog } from './RecycleNodeDialog';
import NodePool from './NodePool';
import { DeleteNodePoolDialog } from './DeleteNodePoolDialog';
import AutoscalePoolDialog from './AutoscalePoolDialog';
import Button from 'src/components/Button';
import {
  queryKey,
  useAllKubernetesNodePoolQuery,
} from 'src/queries/kubernetes';
import { useAllLinodeTypesQuery } from 'src/queries/linodes';
import CircleProgress from 'src/components/CircleProgress';
import { queryClient } from 'src/queries/base';
import { RecycleClusterDialog } from '../RecycleClusterDialog';
import classNames from 'classnames';

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
      marginBottom: theme.spacing(3),
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
    marginBottom: theme.spacing(3),
  },
  mobileSpacing: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
}));

export interface Props {
  clusterID: number;
  clusterLabel: string;
}

export const NodePoolsDisplay = (props: Props) => {
  const { clusterID, clusterLabel } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { data: pools, isLoading } = useAllKubernetesNodePoolQuery(clusterID);
  const { data: types } = useAllLinodeTypesQuery();

  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const [selectedPoolId, setSelectedPoolId] = useState(-1);
  const selectedPool = pools?.find((pool) => pool.id === selectedPoolId);

  const [isDeleteNodePoolOpen, setIsDeleteNodePoolOpen] = useState(false);
  const [isResizeDrawerOpen, setIsResizeDrawerOpen] = useState(false);
  const [isRecycleAllPoolNodesOpen, setIsRecycleAllPoolNodesOpen] = useState(
    false
  );
  const [isRecycleNodeOpen, setIsRecycleNodeOpen] = useState(false);
  const [isRecycleClusterOpen, setIsRecycleClusterOpen] = useState(false);

  const autoscalePoolDialog = useDialog<any>(autoscaleNodePool);

  const [numPoolsToDisplay, setNumPoolsToDisplay] = React.useState(25);

  const handleShowMore = () => {
    if (numPoolsToDisplay < (pools?.length ?? 0)) {
      setNumPoolsToDisplay(
        Math.min(numPoolsToDisplay + 25, pools?.length ?? 0)
      );
    }
  };

  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);

  const handleOpenAddDrawer = () => {
    setAddDrawerOpen(true);
  };

  const handleOpenResizeDrawer = (poolId: number) => {
    setSelectedPoolId(poolId);
    setIsResizeDrawerOpen(true);
  };

  const handleAutoscalePool = (
    values: AutoscaleNodePoolValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setWarningMessage: (warning: string) => void
  ) => {
    const { dialog, submitDialog, handleError } = autoscalePoolDialog;
    if (!dialog.entityID) {
      return;
    }

    submitDialog({ clusterID, nodePoolID: dialog.entityID, autoscaler: values })
      .then(() => {
        enqueueSnackbar(
          `Autoscaling updated for Node Pool ${dialog.entityID}.`,
          { variant: 'success' }
        );
        queryClient.invalidateQueries([queryKey, 'pools', clusterID]);
      })
      .catch((err) => {
        handleError(
          getAPIErrorOrDefault(
            err,
            `Error updating autoscaling for Node Pool ${dialog.entityID}.`
          )[0].reason
        );
      })
      .finally(() => {
        setSubmitting(false);
        setWarningMessage('');
      });
  };

  const _pools = pools?.slice(0, numPoolsToDisplay);

  const getAutoscaler = () =>
    pools?.find((pool) => pool.id === autoscalePoolDialog.dialog.entityID)
      ?.autoscaler;

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

  if (isLoading || pools === undefined) {
    return <CircleProgress />;
  }

  return (
    <>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        updateFor={[classes]}
      >
        <Grid item>
          <Typography
            variant="h2"
            className={classNames(
              classes.nodePoolHeader,
              classes.mobileSpacing
            )}
          >
            Node Pools
          </Typography>
        </Grid>
        <Grid item>
          <Button
            buttonType="secondary"
            className={classNames(classes.button, classes.mobileSpacing)}
            onClick={() => setIsRecycleClusterOpen(true)}
          >
            Recycle All Nodes
          </Button>
          <Button
            buttonType="primary"
            className={classNames(classes.button, classes.mobileSpacing)}
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
              {_pools?.map((thisPool) => {
                const { id, nodes } = thisPool;

                const thisPoolType = types?.find(
                  (thisType) => thisType.id === thisPool.type
                );

                const typeLabel = thisPoolType?.label ?? 'Unknown type';

                return (
                  <div key={id} className={classes.nodePool}>
                    <NodePool
                      poolId={thisPool.id}
                      typeLabel={typeLabel}
                      nodes={nodes ?? []}
                      autoscaler={thisPool.autoscaler}
                      handleClickResize={handleOpenResizeDrawer}
                      openDeletePoolDialog={(id) => {
                        setSelectedPoolId(id);
                        setIsDeleteNodePoolOpen(true);
                      }}
                      openRecycleAllNodesDialog={(id) => {
                        setSelectedPoolId(id);
                        setIsRecycleAllPoolNodesOpen(true);
                      }}
                      openRecycleNodeDialog={(nodeId, linodeLabel) => {
                        setSelectedNodeId(nodeId);
                        setIsRecycleNodeOpen(true);
                      }}
                      openAutoscalePoolDialog={autoscalePoolDialog.openDialog}
                      isOnlyNodePool={pools?.length === 1}
                    />
                  </div>
                );
              })}
              {pools?.length > numPoolsToDisplay && (
                <Waypoint onEnter={handleShowMore} scrollableAncestor="window">
                  <div style={{ minHeight: 50 }} />
                </Waypoint>
              )}
            </Grid>

            <AddNodePoolDrawer
              clusterId={clusterID}
              clusterLabel={clusterLabel}
              open={addDrawerOpen}
              onClose={() => setAddDrawerOpen(false)}
            />
            <ResizeNodePoolDrawer
              open={isResizeDrawerOpen}
              kubernetesClusterId={clusterID}
              onClose={() => setIsResizeDrawerOpen(false)}
              nodePool={selectedPool}
            />
            <DeleteNodePoolDialog
              kubernetesClusterId={clusterID}
              nodePool={selectedPool}
              onClose={() => setIsDeleteNodePoolOpen(false)}
              open={isDeleteNodePoolOpen}
            />
            <AutoscalePoolDialog
              getAutoscaler={getAutoscaler}
              handleOpenResizeDrawer={handleOpenResizeDrawer}
              onSubmit={(
                values: AutoscaleNodePoolValues,
                setSubmitting: (isSubmitting: boolean) => void,
                setWarningMessage: (warning: string) => void
              ) =>
                handleAutoscalePool(values, setSubmitting, setWarningMessage)
              }
              onClose={autoscalePoolDialog.closeDialog}
              open={autoscalePoolDialog.dialog.isOpen}
              error={autoscalePoolDialog.dialog.error}
              loading={autoscalePoolDialog.dialog.isLoading}
              poolID={autoscalePoolDialog.dialog.entityID}
            />
            <RecycleNodeDialog
              onClose={() => setIsRecycleNodeOpen(false)}
              open={isRecycleNodeOpen}
              nodeId={selectedNodeId}
              clusterId={clusterID}
            />
            <RecycleNodePoolDialog
              open={isRecycleAllPoolNodesOpen}
              onClose={() => setIsRecycleAllPoolNodesOpen(false)}
              clusterId={clusterID}
              nodePoolId={selectedPoolId}
            />
            <RecycleClusterDialog
              open={isRecycleClusterOpen}
              onClose={() => setIsRecycleClusterOpen(false)}
              clusterId={clusterID}
            />
          </Grid>
        )}
      </Paper>
    </>
  );
};
