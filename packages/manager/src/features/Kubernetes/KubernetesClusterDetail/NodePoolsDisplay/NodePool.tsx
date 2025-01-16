import {
  Box,
  Paper,
  Stack,
  StyledActionButton,
  Tooltip,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { useFlags } from 'src/hooks/useFlags';

import { NodeTable } from './NodeTable';

import type {
  AutoscaleSettings,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import type { EncryptionStatus } from '@linode/api-v4/lib/linodes/types';

interface Props {
  autoscaler: AutoscaleSettings;
  clusterId: number;
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
  tags: string[];
  typeLabel: string;
}

export const NodePool = (props: Props) => {
  const {
    autoscaler,
    clusterId,
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
    tags,
    typeLabel,
  } = props;

  const flags = useFlags();

  return (
    <Box data-qa-node-pool-id={poolId} data-qa-node-pool-section>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0,
        }}
      >
        <Typography variant="h2">{typeLabel}</Typography>
        <Hidden smUp>
          <ActionMenu
            actionsList={[
              {
                disabled: !flags.lkeEnterprise?.enabled,
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
          />
        </Hidden>
        <Hidden smDown>
          <Stack alignItems="center" direction="row">
            {flags.lkeEnterprise?.enabled && (
              <StyledActionButton
                compactY
                onClick={() => handleClickLabelsAndTaints(poolId)}
              >
                Labels and Taints
              </StyledActionButton>
            )}
            <StyledActionButton
              compactY
              onClick={() => openAutoscalePoolDialog(poolId)}
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
              onClick={() => handleClickResize(poolId)}
            >
              Resize Pool
            </StyledActionButton>
            <StyledActionButton
              compactY
              onClick={() => openRecycleAllNodesDialog(poolId)}
            >
              Recycle Pool Nodes
            </StyledActionButton>
            <Tooltip
              disableFocusListener={!isOnlyNodePool}
              disableHoverListener={!isOnlyNodePool}
              disableTouchListener={!isOnlyNodePool}
              title="Clusters must contain at least one node pool."
            >
              <div>
                <StyledActionButton
                  compactY
                  disabled={isOnlyNodePool}
                  onClick={() => openDeletePoolDialog(poolId)}
                >
                  Delete Pool
                </StyledActionButton>
              </div>
            </Tooltip>
          </Stack>
        </Hidden>
      </Paper>
      <NodeTable
        clusterId={clusterId}
        encryptionStatus={encryptionStatus}
        nodes={nodes}
        openRecycleNodeDialog={openRecycleNodeDialog}
        poolId={poolId}
        tags={tags}
        typeLabel={typeLabel}
      />
    </Box>
  );
};
