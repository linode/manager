import {
  Box,
  Button,
  CircleProgress,
  ErrorState,
  Select,
  Stack,
  Typography,
} from '@linode/ui';
import { Hidden } from '@linode/ui';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { FormLabel } from 'src/components/FormLabel';
import { useDefaultExpandedNodePools } from 'src/hooks/useDefaultExpandedNodePools';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';

import { RecycleClusterDialog } from '../RecycleClusterDialog';
import { RecycleNodePoolDialog } from '../RecycleNodePoolDialog';
import { AddNodePoolDrawer } from './AddNodePoolDrawer';
import { AutoscaleNodePoolDrawer } from './AutoscaleNodePoolDrawer';
import { ConfigureNodePoolDrawer } from './ConfigureNodePool/ConfigureNodePoolDrawer';
import { DeleteNodePoolDialog } from './DeleteNodePoolDialog';
import { LabelAndTaintDrawer } from './LabelsAndTaints/LabelAndTaintDrawer';
import { NodePool } from './NodePool';
import { RecycleNodeDialog } from './RecycleNodeDialog';
import { ResizeNodePoolDrawer } from './ResizeNodePoolDrawer';

import type { KubernetesTier } from '@linode/api-v4';

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
  isLkeClusterRestricted: boolean;
}

export const NodePoolsDisplay = (props: Props) => {
  const {
    clusterCreated,
    clusterID,
    clusterLabel,
    clusterRegionId,
    clusterTier,
    isLkeClusterRestricted,
  } = props;

  const {
    data: pools,
    error: poolsError,
    isLoading,
  } = useAllKubernetesNodePoolQuery(clusterID, { refetchInterval: 15000 });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const [selectedPoolId, setSelectedPoolId] = useState(-1);
  const selectedPool = pools?.find((pool) => pool.id === selectedPoolId);

  const [isConfigureNodePoolDrawerOpen, setIsConfigureNodePoolDrawerOpen] =
    useState(false);
  const [isDeleteNodePoolOpen, setIsDeleteNodePoolOpen] = useState(false);
  const [isLabelsAndTaintsDrawerOpen, setIsLabelsAndTaintsDrawerOpen] =
    useState(false);
  const [isResizeDrawerOpen, setIsResizeDrawerOpen] = useState(false);
  const [isRecycleAllPoolNodesOpen, setIsRecycleAllPoolNodesOpen] =
    useState(false);
  const [isRecycleNodeOpen, setIsRecycleNodeOpen] = useState(false);
  const [isRecycleClusterOpen, setIsRecycleClusterOpen] = useState(false);

  const [isAutoscaleDrawerOpen, setIsAutoscaleDrawerOpen] = useState(false);

  const [numPoolsToDisplay, setNumPoolsToDisplay] = React.useState(5);
  const _pools = pools?.slice(0, numPoolsToDisplay);

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

  const handleOpenConfigureNodePoolDrawer = (poolId: number) => {
    setSelectedPoolId(poolId);
    setIsConfigureNodePoolDrawerOpen(true);
  };

  const handleOpenAutoscaleDrawer = (poolId: number) => {
    setSelectedPoolId(poolId);
    setIsAutoscaleDrawerOpen(true);
  };

  const handleOpenResizeDrawer = (poolId: number) => {
    setSelectedPoolId(poolId);
    setIsResizeDrawerOpen(true);
  };

  const handleOpenLabelsAndTaintsDrawer = (poolId: number) => {
    setSelectedPoolId(poolId);
    setIsLabelsAndTaintsDrawerOpen(true);
  };

  const {
    defaultExpandedPools,
    expandedAccordions,
    handleAccordionClick,
    setExpandedAccordions,
  } = useDefaultExpandedNodePools(clusterID, _pools);

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
        sx={{
          paddingBottom: 1,
          paddingLeft: { md: 0, sm: 1, xs: 1 },
          paddingTop: 3,
        }}
      >
        <Stack alignItems="center" direction="row">
          <Typography variant="h2">Node Pools</Typography>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          gap={1}
          sx={(theme) => ({
            [theme.breakpoints.down('md')]: {
              paddingTop: theme.spacing(1),
              width: '100%',
            },
          })}
        >
          <FormLabel htmlFor={ariaIdentifier} sx={{ mb: 0 }}>
            <Typography ml={1} mr={1}>
              Status
            </Typography>
          </FormLabel>
          <Select
            data-qa-status-filter
            hideLabel
            id={ariaIdentifier}
            label="Status"
            onChange={(_, item) => setStatusFilter(item?.value)}
            options={statusOptions ?? []}
            placeholder="Select a status"
            sx={{ width: 130 }}
            value={
              statusOptions?.find((option) => option.value === statusFilter) ??
              null
            }
          />
          {(expandedAccordions === undefined &&
            defaultExpandedPools.length > 0) ||
          (expandedAccordions && expandedAccordions.length > 0) ? (
            <Button
              buttonType="secondary"
              endIcon={<ExpandLessIcon />}
              onClick={() => setExpandedAccordions([])}
              sx={{
                '& span': { marginLeft: 0.5 },
                paddingLeft: 0.5,
                paddingRight: 0.5,
              }}
            >
              Collapse All Pools
            </Button>
          ) : (
            <Button
              buttonType="secondary"
              endIcon={<ExpandMoreIcon />}
              onClick={() => {
                const expandedAccordions = _pools?.map(({ id }) => id) ?? [];
                setExpandedAccordions(expandedAccordions);
              }}
              sx={{
                '& span': { marginLeft: 0.5 },
                paddingLeft: 0.5,
                paddingRight: 0.5,
              }}
            >
              Expand All Pools
            </Button>
          )}
          <Hidden mdUp>
            <Box sx={{ ml: 'auto' }}>
              <ActionMenu
                actionsList={[
                  {
                    disabled: isLkeClusterRestricted,
                    onClick: () => setIsRecycleClusterOpen(true),
                    title: 'Recycle All Nodes',
                  },
                  {
                    disabled: isLkeClusterRestricted,
                    onClick: handleOpenAddDrawer,
                    title: 'Add a Node Pool',
                  },
                ]}
                ariaLabel={`Action menu for Node Pools header`}
              />
            </Box>
          </Hidden>
          <Hidden mdDown>
            <Button
              buttonType="outlined"
              disabled={isLkeClusterRestricted}
              onClick={() => setIsRecycleClusterOpen(true)}
            >
              Recycle All Nodes
            </Button>
            <Button
              buttonType="primary"
              disabled={isLkeClusterRestricted}
              onClick={handleOpenAddDrawer}
            >
              Add a Node Pool
            </Button>
          </Hidden>
        </Stack>
      </Stack>
      {poolsError && <ErrorState errorText={poolsError[0].reason} />}
      <Stack spacing={2}>
        {_pools?.map((thisPool) => {
          const { count, disk_encryption, id, nodes, tags, label, type } =
            thisPool;
          return (
            <NodePool
              accordionExpanded={
                expandedAccordions === undefined
                  ? defaultExpandedPools.includes(id)
                  : expandedAccordions.includes(id)
              }
              autoscaler={thisPool.autoscaler}
              clusterCreated={clusterCreated}
              clusterId={clusterID}
              clusterTier={clusterTier}
              count={count}
              encryptionStatus={disk_encryption}
              handleAccordionClick={() => handleAccordionClick(id)}
              handleClickAutoscale={handleOpenAutoscaleDrawer}
              handleClickConfigureNodePool={handleOpenConfigureNodePoolDrawer}
              handleClickLabelsAndTaints={handleOpenLabelsAndTaintsDrawer}
              handleClickResize={handleOpenResizeDrawer}
              isLkeClusterRestricted={isLkeClusterRestricted}
              isOnlyNodePool={pools?.length === 1}
              key={id}
              label={label}
              nodes={nodes ?? []}
              openDeletePoolDialog={(id) => {
                setSelectedPoolId(id);
                setIsDeleteNodePoolOpen(true);
              }}
              openRecycleAllNodesDialog={(id) => {
                setSelectedPoolId(id);
                setIsRecycleAllPoolNodesOpen(true);
              }}
              openRecycleNodeDialog={(nodeId) => {
                setSelectedNodeId(nodeId);
                setIsRecycleNodeOpen(true);
              }}
              poolId={thisPool.id}
              poolVersion={thisPool.k8s_version}
              statusFilter={statusFilter}
              tags={tags}
              type={type}
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
        clusterTier={clusterTier}
        onClose={() => setAddDrawerOpen(false)}
        open={addDrawerOpen}
      />
      <ConfigureNodePoolDrawer
        clusterId={clusterID}
        clusterTier={clusterTier}
        nodePool={selectedPool}
        onClose={() => setIsConfigureNodePoolDrawerOpen(false)}
        open={isConfigureNodePoolDrawerOpen}
      />
      <LabelAndTaintDrawer
        clusterId={clusterID}
        nodePool={selectedPool}
        onClose={() => setIsLabelsAndTaintsDrawerOpen(false)}
        open={isLabelsAndTaintsDrawerOpen}
      />
      <ResizeNodePoolDrawer
        clusterTier={clusterTier}
        kubernetesClusterId={clusterID}
        kubernetesRegionId={clusterRegionId}
        nodePool={selectedPool}
        onClose={() => setIsResizeDrawerOpen(false)}
        open={isResizeDrawerOpen}
      />
      <AutoscaleNodePoolDrawer
        clusterId={clusterID}
        clusterTier={clusterTier}
        handleOpenResizeDrawer={handleOpenResizeDrawer}
        nodePool={selectedPool}
        onClose={() => setIsAutoscaleDrawerOpen(false)}
        open={isAutoscaleDrawerOpen}
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
