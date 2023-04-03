import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { RecycleNodePoolDialog } from '../RecycleNodePoolDialog';
import { AddNodePoolDrawer } from './AddNodePoolDrawer';
import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';
import { RecycleNodeDialog } from './RecycleNodeDialog';
import NodePool from './NodePool';
import { DeleteNodePoolDialog } from './DeleteNodePoolDialog';
import { AutoscalePoolDialog } from './AutoscalePoolDialog';
import Button from 'src/components/Button';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import CircleProgress from 'src/components/CircleProgress';
import { RecycleClusterDialog } from '../RecycleClusterDialog';
import classNames from 'classnames';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';

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
    [theme.breakpoints.down('md')]: {
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

  const {
    data: pools,
    isLoading,
    error: poolsError,
  } = useAllKubernetesNodePoolQuery(clusterID, { refetchInterval: 15000 });

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

  const [isAutoscaleDialogOpen, setIsAutoscaleDialogOpen] = useState(false);

  const [numPoolsToDisplay, setNumPoolsToDisplay] = React.useState(25);
  const _pools = pools?.slice(0, numPoolsToDisplay);

  const typesQuery = useSpecificTypes(_pools?.map((pool) => pool.type) ?? []);
  const types = extendTypesQueryResult(typesQuery);

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
          <ErrorState errorText={poolsError?.[0].reason} />
        ) : (
          <Grid container direction="column">
            <Grid item xs={12} className={classes.displayTable}>
              {_pools?.map((thisPool) => {
                const { id, nodes } = thisPool;

                const thisPoolType = types?.find(
                  (thisType) => thisType.id === thisPool.type
                );

                const typeLabel =
                  thisPoolType?.formattedLabel ?? 'Unknown type';

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
                      openAutoscalePoolDialog={(poolId) => {
                        setSelectedPoolId(poolId);
                        setIsAutoscaleDialogOpen(true);
                      }}
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
              handleOpenResizeDrawer={handleOpenResizeDrawer}
              onClose={() => setIsAutoscaleDialogOpen(false)}
              open={isAutoscaleDialogOpen}
              nodePool={selectedPool}
              clusterId={clusterID}
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
