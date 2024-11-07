import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';

import { RecycleClusterDialog } from '../RecycleClusterDialog';
import { RecycleNodePoolDialog } from '../RecycleNodePoolDialog';
import { AddNodePoolDrawer } from './AddNodePoolDrawer';
import { AutoscalePoolDialog } from './AutoscalePoolDialog';
import { DeleteNodePoolDialog } from './DeleteNodePoolDialog';
import { NodePool } from './NodePool';
import { RecycleNodeDialog } from './RecycleNodeDialog';
import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

import type { Region } from '@linode/api-v4';

export interface Props {
  clusterID: number;
  clusterLabel: string;
  clusterRegionId: string;
  regionsData: Region[];
}

export const NodePoolsDisplay = (props: Props) => {
  const { clusterID, clusterLabel, clusterRegionId, regionsData } = props;

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
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ paddingLeft: { md: 0, sm: 1, xs: 1 } }}
      >
        <Typography variant="h2">Node Pools</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            buttonType="secondary"
            onClick={() => setIsRecycleClusterOpen(true)}
          >
            Recycle All Nodes
          </Button>
          <Button buttonType="primary" onClick={handleOpenAddDrawer}>
            Add a Node Pool
          </Button>
        </Stack>
      </Stack>
      {poolsError && <ErrorState errorText={poolsError[0].reason} />}
      <Stack spacing={2}>
        {_pools?.map((thisPool) => {
          const { disk_encryption, id, nodes } = thisPool;

          const thisPoolType = types?.find(
            (thisType) => thisType.id === thisPool.type
          );

          const typeLabel = thisPoolType?.formattedLabel ?? 'Unknown type';

          return (
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
              encryptionStatus={disk_encryption}
              handleClickResize={handleOpenResizeDrawer}
              isOnlyNodePool={pools?.length === 1}
              key={id}
              nodes={nodes ?? []}
              poolId={thisPool.id}
              typeLabel={typeLabel}
            />
          );
        })}
      </Stack>
      {pools?.length > numPoolsToDisplay && (
        <Waypoint onEnter={handleShowMore}>
          <div style={{ minHeight: 50 }} />
        </Waypoint>
      )}
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
        kubernetesRegionId={clusterRegionId}
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
    </>
  );
};
