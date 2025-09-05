import {
  Box,
  CloseIcon,
  IconButton,
  LinkButton,
  Stack,
  Typography,
} from '@linode/ui';
import { pluralize } from '@linode/utilities';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
  UPDATE_STRATEGY_OPTIONS,
} from 'src/features/Kubernetes/constants';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';

import type {
  CreateClusterFormValues,
  NodePoolConfigDrawerHandlerParams,
} from '../CreateCluster/CreateCluster';
import type { KubernetesTier } from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';

export interface Props {
  clusterTier?: KubernetesTier;
  handleConfigurePool?: (params: NodePoolConfigDrawerHandlerParams) => void;
  nodeCount: number;
  onRemove: () => void;
  poolIndex: number;
  poolType: ExtendedType | null;
  price?: null | number; // Can be undefined until a Region is selected.
  updateNodeCount: (count: number) => void;
}

export const NodePoolSummaryItem = React.memo((props: Props) => {
  const {
    handleConfigurePool,
    nodeCount,
    onRemove,
    poolIndex,
    poolType,
    price,
    updateNodeCount,
    clusterTier,
  } = props;

  const { isLkeEnterprisePostLAFeatureEnabled } = useIsLkeEnterpriseEnabled();

  const { control } = useFormContext<CreateClusterFormValues>();
  const nodePoolsWatcher = useWatch({
    control,
    name: 'nodePools',
  });
  const thisPool = nodePoolsWatcher[poolIndex];

  // This should never happen but TS wants us to account for the situation
  // where we fail to match a selected type against our types list.
  if (poolType === null) {
    return null;
  }
  return (
    <Stack data-testid="node-pool-summary" spacing={1}>
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
      >
        <Stack>
          <Typography variant="h3">{poolType.formattedLabel} Plan</Typography>
          <Typography>
            {pluralize('CPU', 'CPUs', poolType.vcpus)}, {poolType.disk / 1024}{' '}
            GB Storage
          </Typography>
          <Typography>
            {isLkeEnterprisePostLAFeatureEnabled && thisPool
              ? UPDATE_STRATEGY_OPTIONS.find(
                  (option) => option.value === thisPool?.update_strategy
                )?.label
              : ''}
          </Typography>
        </Stack>
        <IconButton
          data-testid="remove-pool-button"
          onClick={onRemove}
          size="small"
          title={`Remove ${poolType.label} Node Pool`}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      {isLkeEnterprisePostLAFeatureEnabled ? (
        pluralize('Node', 'Nodes', nodeCount)
      ) : (
        <EnhancedNumberInput
          max={
            clusterTier === 'enterprise'
              ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
              : MAX_NODES_PER_POOL_STANDARD_TIER
          }
          min={1}
          setValue={updateNodeCount}
          value={nodeCount}
        />
      )}
      <Box pt={0.5}>
        {price ? (
          <DisplayPrice
            fontSize="14px"
            interval="month"
            price={price}
            variant="body1"
          />
        ) : undefined}
      </Box>
      {isLkeEnterprisePostLAFeatureEnabled && handleConfigurePool && (
        <StyledLinkButtonBox>
          <LinkButton
            onClick={() =>
              handleConfigurePool({
                drawerMode: 'edit',
                isOpen: true,
                planLabel: poolType.id,
                poolIndex,
              })
            }
          >
            Edit Configuration
          </LinkButton>
        </StyledLinkButtonBox>
      )}
    </Stack>
  );
});
