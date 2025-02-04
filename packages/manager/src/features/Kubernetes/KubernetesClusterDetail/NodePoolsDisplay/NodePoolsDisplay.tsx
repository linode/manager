import { Button, CircleProgress, Select, Stack, Typography } from '@linode/ui';
import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { FormLabel } from 'src/components/FormLabel';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';

import { RecycleClusterDialog } from '../RecycleClusterDialog';
import { RecycleNodePoolDialog } from '../RecycleNodePoolDialog';
import { AddNodePoolDrawer } from './AddNodePoolDrawer';
import { AutoscalePoolDialog } from './AutoscalePoolDialog';
import { DeleteNodePoolDialog } from './DeleteNodePoolDialog';
import { LabelAndTaintDrawer } from './LabelsAndTaints/LabelAndTaintDrawer';
import { NodePool } from './NodePool';
import { RecycleNodeDialog } from './RecycleNodeDialog';
import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

import type { KubernetesTier, Region } from '@linode/api-v4';

export type StatusFilter = 'all' | 'offline' | 'provisioning' | 'running';

interface StatusFilterOption {
  label: string;
  value: StatusFilter;
}

const statusOptions: StatusFilterOption[] = [
  {
    label: 'Show All',
    value: 'all',
  },
  {
    label: 'Running',
    value: 'running',
  },
  {
    label: 'Offline',
    value: 'offline',
  },
  {
    label: 'Provisioning',
    value: 'provisioning',
  },
];

const ariaIdentifier = 'node-pool-status-filter';

export interface Props {
  clusterCreated: string;
  clusterID: number;
  clusterLabel: string;
  clusterRegionId: string;
  clusterTier: KubernetesTier;
  regionsData: Region[];
}

export const NodePoolsDisplay = (props: Props) => {
  const {
    clusterCreated,
    clusterID,
    clusterLabel,
    clusterRegionId,
    clusterTier,
    regionsData,
  } = props;

  const {
    data: pools,
    error: poolsError,
    isLoading,
  } = useAllKubernetesNodePoolQuery(clusterID, { refetchInterval: 15000 });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const [selectedPoolId, setSelectedPoolId] = useState(-1);
  const selectedPool = pools?.find((pool) => pool.id === selectedPoolId);

  const [isDeleteNodePoolOpen, setIsDeleteNodePoolOpen] = useState(false);
  const [
    isLabelsAndTaintsDrawerOpen,
    setIsLabelsAndTaintsDrawerOpen,
  ] = useState(false);
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

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');

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

  const handleOpenLabelsAndTaintsDrawer = (poolId: number) => {
    setSelectedPoolId(poolId);
    setIsLabelsAndTaintsDrawerOpen(true);
  };

  const defaultExpandedPools =
    _pools
      ?.filter((pool) => {
        // If there's only one node pool, expand it no matter how many nodes there are
        if (_pools.length === 1) {
          return true;
        }
        // If there are more than 3 node pools, keep them all collapsed
        if (_pools.length > 3) {
          return false;
        }
        // Otherwise, if the user has between 1-3 node pools:
        // If the node pool has 1-3 nodes, keep it expanded
        if (pool.count <= 3) {
          return true;
        }
        // Collapse everything else
        return false;
      })
      .map(({ id }) => id) ?? [];

  if (isLoading || pools === undefined) {
    return <CircleProgress />;
  }

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        justifyContent="space-between"
        spacing={2}
        sx={{ paddingLeft: { md: 0, sm: 1, xs: 1 }, paddingTop: 3 }}
      >
        <Typography variant="h2">Node Pools</Typography>
        <Stack direction="row" spacing={1}>
          <Stack alignItems="end" direction="row">
            <FormLabel htmlFor={ariaIdentifier}>
              <Typography ml={1} mr={1}>
                Status
              </Typography>
            </FormLabel>
            <Select
              value={
                statusOptions?.find(
                  (option) => option.value === statusFilter
                ) ?? null
              }
              data-qa-status-filter
              hideLabel
              id={ariaIdentifier}
              label="Status"
              onChange={(_, item) => setStatusFilter(item?.value)}
              options={statusOptions ?? []}
              placeholder="Select a status"
              sx={{ width: 130 }}
            />
          </Stack>
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
          const { count, disk_encryption, id, nodes, tags } = thisPool;

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
              accordionExpanded={defaultExpandedPools.includes(id)}
              autoscaler={thisPool.autoscaler}
              clusterCreated={clusterCreated}
              clusterId={clusterID}
              clusterTier={clusterTier}
              count={count}
              encryptionStatus={disk_encryption}
              handleClickLabelsAndTaints={handleOpenLabelsAndTaintsDrawer}
              handleClickResize={handleOpenResizeDrawer}
              isOnlyNodePool={pools?.length === 1}
              key={id}
              nodes={nodes ?? []}
              poolId={thisPool.id}
              statusFilter={statusFilter}
              tags={tags}
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
      <LabelAndTaintDrawer
        clusterId={clusterID}
        nodePool={selectedPool}
        onClose={() => setIsLabelsAndTaintsDrawerOpen(false)}
        open={isLabelsAndTaintsDrawerOpen}
      />
      <ResizeNodePoolDrawer
        kubernetesClusterId={clusterID}
        kubernetesRegionId={clusterRegionId}
        nodePool={selectedPool}
        onClose={() => setIsResizeDrawerOpen(false)}
        open={isResizeDrawerOpen}
      />
      <AutoscalePoolDialog
        clusterId={clusterID}
        handleOpenResizeDrawer={handleOpenResizeDrawer}
        nodePool={selectedPool}
        onClose={() => setIsAutoscaleDialogOpen(false)}
        open={isAutoscaleDialogOpen}
      />
      <DeleteNodePoolDialog
        kubernetesClusterId={clusterID}
        nodePool={selectedPool}
        onClose={() => setIsDeleteNodePoolOpen(false)}
        open={isDeleteNodePoolOpen}
      />
      <RecycleClusterDialog
        clusterId={clusterID}
        onClose={() => setIsRecycleClusterOpen(false)}
        open={isRecycleClusterOpen}
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
    </>
  );
};
