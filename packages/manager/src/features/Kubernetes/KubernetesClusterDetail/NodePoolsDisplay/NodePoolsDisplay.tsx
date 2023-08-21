import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';

import { RecycleClusterDialog } from '../RecycleClusterDialog';
import { RecycleNodePoolDialog } from '../RecycleNodePoolDialog';
import { AddNodePoolDrawer } from './AddNodePoolDrawer';
import { AutoscalePoolDialog } from './AutoscalePoolDialog';
import { DeleteNodePoolDialog } from './DeleteNodePoolDialog';
import NodePool from './NodePool';
import { RecycleNodeDialog } from './RecycleNodeDialog';
import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

import type { Region } from '@linode/api-v4';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  displayTable: {
    '& > div': {
      marginBottom: theme.spacing(3),
    },
    '& > div:last-child': {
      marginBottom: 0,
    },
    padding: '8px 8px 0px',
    width: '100%',
  },
  nodePoolHeader: {
    marginBottom: theme.spacing(),
    [theme.breakpoints.only('sm')]: {
      marginLeft: theme.spacing(),
    },
    [theme.breakpoints.only('xs')]: {
      marginLeft: theme.spacing(),
    },
  },
  nodePoolHeaderOuter: {
    alignItems: 'center',
    display: 'flex',
  },
}));

export interface Props {
  clusterID: number;
  clusterLabel: string;
  clusterRegionId: string;
  regionsData: Region[];
}

export const NodePoolsDisplay = (props: Props) => {
  const { clusterID, clusterLabel, clusterRegionId, regionsData } = props;
  const classes = useStyles();

  const {
    data: pools,
    error: poolsError,
    isLoading,
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

  const [numPoolsToDisplay, setNumPoolsToDisplay] = React.useState(5);
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
        alignItems="center"
        container
        justifyContent="space-between"
        spacing={2}
      >
        <Grid>
          <Typography
            className={classNames(classes.nodePoolHeader)}
            variant="h2"
          >
            Node Pools
          </Typography>
        </Grid>
        <Grid>
          <Button
            buttonType="secondary"
            className={classNames(classes.button)}
            onClick={() => setIsRecycleClusterOpen(true)}
          >
            Recycle All Nodes
          </Button>
          <Button
            buttonType="primary"
            className={classNames(classes.button)}
            onClick={handleOpenAddDrawer}
          >
            Add a Node Pool
          </Button>
        </Grid>
      </Grid>
      <Paper>
        {poolsError ? (
          <ErrorState errorText={poolsError?.[0].reason} />
        ) : (
          <Grid container direction="column">
            <Grid xs={12}>
              {_pools?.map((thisPool) => {
                const { id, nodes } = thisPool;

                const thisPoolType = types?.find(
                  (thisType) => thisType.id === thisPool.type
                );

                const typeLabel =
                  thisPoolType?.formattedLabel ?? 'Unknown type';

                return (
                  <div key={id}>
                    <NodePool
                      openAutoscalePoolDialog={(poolId) => {
                        setSelectedPoolId(poolId);
                        setIsAutoscaleDialogOpen(true);
                      }}
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
                      autoscaler={thisPool.autoscaler}
                      handleClickResize={handleOpenResizeDrawer}
                      isOnlyNodePool={pools?.length === 1}
                      nodes={nodes ?? []}
                      poolId={thisPool.id}
                      typeLabel={typeLabel}
                    />
                  </div>
                );
              })}
              {pools?.length > numPoolsToDisplay && (
                <Waypoint onEnter={handleShowMore}>
                  <div style={{ minHeight: 50 }} />
                </Waypoint>
              )}
            </Grid>

            <AddNodePoolDrawer
              clusterId={clusterID}
              clusterLabel={clusterLabel}
              clusterRegionId={clusterRegionId}
              onClose={() => setAddDrawerOpen(false)}
              open={addDrawerOpen}
              regionsData={regionsData}
            />
            <ResizeNodePoolDrawer
              kubernetesClusterId={clusterID}
              nodePool={selectedPool}
              onClose={() => setIsResizeDrawerOpen(false)}
              open={isResizeDrawerOpen}
            />
            <DeleteNodePoolDialog
              kubernetesClusterId={clusterID}
              nodePool={selectedPool}
              onClose={() => setIsDeleteNodePoolOpen(false)}
              open={isDeleteNodePoolOpen}
            />
            <AutoscalePoolDialog
              clusterId={clusterID}
              handleOpenResizeDrawer={handleOpenResizeDrawer}
              nodePool={selectedPool}
              onClose={() => setIsAutoscaleDialogOpen(false)}
              open={isAutoscaleDialogOpen}
            />
            <RecycleNodeDialog
              clusterId={clusterID}
              nodeId={selectedNodeId}
              onClose={() => setIsRecycleNodeOpen(false)}
              open={isRecycleNodeOpen}
            />
            <RecycleNodePoolDialog
              clusterId={clusterID}
              nodePoolId={selectedPoolId}
              onClose={() => setIsRecycleAllPoolNodesOpen(false)}
              open={isRecycleAllPoolNodesOpen}
            />
            <RecycleClusterDialog
              clusterId={clusterID}
              onClose={() => setIsRecycleClusterOpen(false)}
              open={isRecycleClusterOpen}
            />
          </Grid>
        )}
      </Paper>
    </>
  );
};
