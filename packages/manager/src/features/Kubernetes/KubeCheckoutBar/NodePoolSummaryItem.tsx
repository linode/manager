import { Box, CloseIcon, IconButton, Stack, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from 'src/features/Kubernetes/constants';

import type { KubernetesTier } from '@linode/api-v4';
import type { ExtendedType } from 'src/utilities/extendType';

export interface Props {
  clusterTier?: KubernetesTier;
  nodeCount: number;
  onRemove: () => void;
  poolType: ExtendedType | null;
  price?: null | number; // Can be undefined until a Region is selected.
  updateNodeCount: (count: number) => void;
}

export const NodePoolSummaryItem = React.memo((props: Props) => {
  const { nodeCount, onRemove, poolType, price, updateNodeCount, clusterTier } =
    props;

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
    </Stack>
  );
});
