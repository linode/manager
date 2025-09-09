import { Accordion, Box, Divider, Hidden, Stack, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { NodePoolFooter } from './NodePoolFooter';
import { NodeTable } from './NodeTable';

import type { StatusFilter } from './NodePoolsDisplay';
import type {
  AutoscaleSettings,
  EncryptionStatus,
  KubeNodePoolResponse,
  KubernetesTier,
  PoolNodeResponse,
} from '@linode/api-v4';

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
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          pr={1}
        >
          <Stack
            alignItems="center"
            direction="row"
            divider={<Divider flexItem orientation="vertical" />}
            spacing={{ sm: 1.5, xs: 1 }}
          >
            <Typography variant="h3">{typeLabel}</Typography>
            <Typography variant="h3">
              {pluralize('Node', 'Nodes', count)}
            </Typography>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={1}>
            {autoscaler.enabled && (
              <Typography mx={1}>
                <Hidden smDown>Autoscaling </Hidden>(Min {autoscaler.min} / Max{' '}
                {autoscaler.max})
              </Typography>
            )}
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
          </Stack>
        </Box>
      }
      onChange={handleAccordionClick}
      // Improve performance by unmounting large content from the DOM when collapsed
      slotProps={{ transition: { unmountOnExit: nodes.length > 25 } }}
      summaryProps={{
        slotProps: {
          content: {
            sx: (theme) => ({
              marginY: `${theme.spacingFunction(4)} !important`,
            }),
          },
        },
      }}
    >
      <NodeTable
        clusterCreated={clusterCreated}
        clusterTier={clusterTier}
        isLkeClusterRestricted={isLkeClusterRestricted}
        nodes={nodes}
        openRecycleNodeDialog={openRecycleNodeDialog}
        statusFilter={statusFilter}
        typeLabel={typeLabel}
      />
      <NodePoolFooter
        clusterId={clusterId}
        clusterTier={clusterTier}
        encryptionStatus={encryptionStatus}
        isLkeClusterRestricted={isLkeClusterRestricted}
        poolId={poolId}
        poolVersion={poolVersion}
        tags={tags}
      />
    </Accordion>
  );
};
