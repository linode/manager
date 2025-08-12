import {
  Accordion,
  Box,
  Stack,
  StyledActionButton,
  Tooltip,
  Typography,
} from '@linode/ui';
import { Hidden } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import Divider from '@mui/material/Divider';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { NodeTable } from './NodeTable';

import type { StatusFilter } from './NodePoolsDisplay';
import type {
  AutoscaleSettings,
  KubeNodePoolResponse,
  KubernetesTier,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';

interface Props {
  accordionExpanded: boolean;
  autoscaler: AutoscaleSettings;
  clusterCreated: string;
  clusterId: number;
  clusterTier: KubernetesTier;
  count: number;
  encryptionStatus: EncryptionStatus;
  handleAccordionClick: () => void;
  handleClickAutoscale: (poolId: number) => void;
  handleClickLabelsAndTaints: (poolId: number) => void;
  handleClickResize: (poolId: number) => void;
  isLkeClusterRestricted: boolean;
  isOnlyNodePool: boolean;
  nodes: PoolNodeResponse[];
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  poolVersion: KubeNodePoolResponse['k8s_version'];
  regionSupportsDiskEncryption: boolean;
  statusFilter: StatusFilter;
  tags: string[];
  typeLabel: string;
}

export const NodePool = (props: Props) => {
  const {
    accordionExpanded,
    autoscaler,
    clusterCreated,
    clusterId,
    clusterTier,
    count,
    encryptionStatus,
    handleAccordionClick,
    handleClickAutoscale,
    handleClickLabelsAndTaints,
    handleClickResize,
    isLkeClusterRestricted,
    isOnlyNodePool,
    nodes,
    openDeletePoolDialog,
    openRecycleAllNodesDialog,
    openRecycleNodeDialog,
    poolId,
    poolVersion,
    regionSupportsDiskEncryption,
    statusFilter,
    tags,
    typeLabel,
  } = props;

  return (
    <Accordion
      data-qa-node-pool-id={poolId}
      data-qa-node-pool-section
      detailProps={{ sx: { paddingBottom: 1 } }}
      expanded={accordionExpanded}
      heading={
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            p: 0,
          }}
        >
          <Box display="flex">
            <Typography variant="h2">{typeLabel}</Typography>
            <Divider
              orientation="vertical"
              sx={(theme) => ({
                height: 16,
                margin: `4px ${theme.spacing(1)}`,
              })}
            />
            <Typography variant="h2">
              {pluralize('Node', 'Nodes', count)}
            </Typography>
          </Box>
          <Hidden lgUp>
            {autoscaler.enabled && (
              <Box position="absolute" right={(theme) => theme.spacing(10)}>
                <Typography mx={1}>
                  (Min {autoscaler.min} / Max {autoscaler.max})
                </Typography>
              </Box>
            )}
            <Box
              alignItems="center"
              position="absolute"
              right={(theme) => theme.spacing(5)}
            >
              <ActionMenu
                actionsList={[
                  {
                    disabled: isLkeClusterRestricted,
                    onClick: () => handleClickLabelsAndTaints(poolId),
                    title: 'Labels and Taints',
                  },
                  {
                    disabled: isLkeClusterRestricted,
                    onClick: () => handleClickAutoscale(poolId),
                    title: 'Autoscale Pool',
                  },
                  {
                    disabled: isLkeClusterRestricted,
                    onClick: () => handleClickResize(poolId),
                    title: 'Resize Pool',
                  },
                  {
                    disabled: isLkeClusterRestricted,
                    onClick: () => openRecycleAllNodesDialog(poolId),
                    title: 'Recycle Pool Nodes',
                  },
                  {
                    disabled: isLkeClusterRestricted || isOnlyNodePool,
                    onClick: () => openDeletePoolDialog(poolId),
                    title: 'Delete Pool',
                    tooltip: isOnlyNodePool
                      ? 'Clusters must contain at least one node pool.'
                      : undefined,
                  },
                ]}
                ariaLabel={`Action menu for Node Pool ${poolId}`}
                stopClickPropagation
              />
            </Box>
          </Hidden>
          <Hidden lgDown>
            <Stack
              alignItems="center"
              data-testid="node-pool-actions"
              direction="row"
              position="absolute"
              right={(theme) => theme.spacing(5)}
            >
              <StyledActionButton
                compactY
                disabled={isLkeClusterRestricted}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickLabelsAndTaints(poolId);
                }}
              >
                Labels and Taints
              </StyledActionButton>
              <StyledActionButton
                compactY
                disabled={isLkeClusterRestricted}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickAutoscale(poolId);
                }}
              >
                Autoscale Pool
              </StyledActionButton>
              {autoscaler.enabled && (
                <Typography mx={1}>
                  (Min {autoscaler.min} / Max {autoscaler.max})
                </Typography>
              )}
              <StyledActionButton
                compactY
                disabled={isLkeClusterRestricted}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickResize(poolId);
                }}
              >
                Resize Pool
              </StyledActionButton>
              <StyledActionButton
                compactY
                disabled={isLkeClusterRestricted}
                onClick={(e) => {
                  e.stopPropagation();
                  openRecycleAllNodesDialog(poolId);
                }}
              >
                Recycle Pool Nodes
              </StyledActionButton>
              <Tooltip
                disableFocusListener={!isOnlyNodePool}
                disableHoverListener={!isOnlyNodePool}
                disableTouchListener={!isOnlyNodePool}
                onClick={(e) => e.stopPropagation()}
                title="Clusters must contain at least one node pool."
              >
                <div>
                  <StyledActionButton
                    compactY
                    disabled={isLkeClusterRestricted || isOnlyNodePool}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeletePoolDialog(poolId);
                    }}
                  >
                    Delete Pool
                  </StyledActionButton>
                </div>
              </Tooltip>
            </Stack>
          </Hidden>
        </Box>
      }
      onChange={handleAccordionClick}
      // Improve performance by unmounting large content from the DOM when collapsed
      slotProps={{ transition: { unmountOnExit: nodes.length > 25 } }}
    >
      <NodeTable
        clusterCreated={clusterCreated}
        clusterId={clusterId}
        clusterTier={clusterTier}
        encryptionStatus={encryptionStatus}
        isLkeClusterRestricted={isLkeClusterRestricted}
        nodes={nodes}
        openRecycleNodeDialog={openRecycleNodeDialog}
        poolId={poolId}
        poolVersion={poolVersion}
        regionSupportsDiskEncryption={regionSupportsDiskEncryption}
        statusFilter={statusFilter}
        tags={tags}
        typeLabel={typeLabel}
      />
    </Accordion>
  );
};
