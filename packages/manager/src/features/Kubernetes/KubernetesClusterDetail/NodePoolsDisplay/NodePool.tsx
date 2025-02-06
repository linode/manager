import {
  Accordion,
  Box,
  Stack,
  StyledActionButton,
  Tooltip,
  Typography,
} from '@linode/ui';
import Divider from '@mui/material/Divider';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { pluralize } from 'src/utilities/pluralize';

import { NodeTable } from './NodeTable';

import type { StatusFilter } from './NodePoolsDisplay';
import type {
  AutoscaleSettings,
  KubernetesTier,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';

interface Props {
  autoscaler: AutoscaleSettings;
  clusterCreated: string;
  clusterId: number;
  clusterTier: KubernetesTier;
  count: number;
  encryptionStatus: EncryptionStatus | undefined;
  handleClickLabelsAndTaints: (poolId: number) => void;
  handleClickResize: (poolId: number) => void;
  isOnlyNodePool: boolean;
  nodes: PoolNodeResponse[];
  openAutoscalePoolDialog: (poolId: number) => void;
  openDeletePoolDialog: (poolId: number) => void;
  openRecycleAllNodesDialog: (poolId: number) => void;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  statusFilter: StatusFilter;
  tags: string[];
  typeLabel: string;
}

export const NodePool = (props: Props) => {
  const {
    autoscaler,
    clusterCreated,
    clusterId,
    clusterTier,
    count,
    encryptionStatus,
    handleClickLabelsAndTaints,
    handleClickResize,
    isOnlyNodePool,
    nodes,
    openAutoscalePoolDialog,
    openDeletePoolDialog,
    openRecycleAllNodesDialog,
    openRecycleNodeDialog,
    poolId,
    statusFilter,
    tags,
    typeLabel,
  } = props;

  return (
    <Accordion
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
              sx={(theme) => ({
                height: 16,
                margin: `4px ${theme.spacing(1)}`,
              })}
              orientation="vertical"
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
                    onClick: () => handleClickLabelsAndTaints(poolId),
                    title: 'Labels and Taints',
                  },
                  {
                    onClick: () => openAutoscalePoolDialog(poolId),
                    title: 'Autoscale Pool',
                  },
                  {
                    onClick: () => handleClickResize(poolId),
                    title: 'Resize Pool',
                  },
                  {
                    onClick: () => openRecycleAllNodesDialog(poolId),
                    title: 'Recycle Pool Nodes',
                  },
                  {
                    disabled: isOnlyNodePool,
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickLabelsAndTaints(poolId);
                }}
                compactY
              >
                Labels and Taints
              </StyledActionButton>
              <StyledActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  openAutoscalePoolDialog(poolId);
                }}
                compactY
              >
                Autoscale Pool
              </StyledActionButton>
              {autoscaler.enabled && (
                <Typography mx={1}>
                  (Min {autoscaler.min} / Max {autoscaler.max})
                </Typography>
              )}
              <StyledActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickResize(poolId);
                }}
                compactY
              >
                Resize Pool
              </StyledActionButton>
              <StyledActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  openRecycleAllNodesDialog(poolId);
                }}
                compactY
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
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeletePoolDialog(poolId);
                    }}
                    compactY
                    disabled={isOnlyNodePool}
                  >
                    Delete Pool
                  </StyledActionButton>
                </div>
              </Tooltip>
            </Stack>
          </Hidden>
        </Box>
      }
      data-qa-node-pool-id={poolId}
      data-qa-node-pool-section
      defaultExpanded={true}
    >
      <NodeTable
        clusterCreated={clusterCreated}
        clusterId={clusterId}
        clusterTier={clusterTier}
        encryptionStatus={encryptionStatus}
        nodes={nodes}
        openRecycleNodeDialog={openRecycleNodeDialog}
        poolId={poolId}
        statusFilter={statusFilter}
        tags={tags}
        typeLabel={typeLabel}
      />
    </Accordion>
  );
};
