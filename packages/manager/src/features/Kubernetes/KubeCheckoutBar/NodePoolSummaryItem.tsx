import { Box, CloseIcon, Divider, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from 'src/features/Kubernetes/constants';

import {
  StyledHeader,
  StyledIconButton,
  StyledNodePoolSummaryBox,
  StyledPriceBox,
} from './KubeCheckoutSummary.styles';

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
    <>
      <Divider dark spacingBottom={12} spacingTop={24} />
      <StyledNodePoolSummaryBox data-testid="node-pool-summary">
        <Box display="flex" justifyContent="space-between">
          <div>
            <StyledHeader>{poolType.formattedLabel} Plan</StyledHeader>
            <Typography>
              {pluralize('CPU', 'CPUs', poolType.vcpus)}, {poolType.disk / 1024}{' '}
              GB Storage
            </Typography>
          </div>
          <StyledIconButton
            data-testid="remove-pool-button"
            onClick={onRemove}
            size="large"
            title={`Remove ${poolType.label} Node Pool`}
          >
            <CloseIcon />
          </StyledIconButton>
        </Box>
        <Box mb={1.5} mt={2}>
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
        </Box>
        <StyledPriceBox>
          {price ? (
            <DisplayPrice fontSize="14px" interval="month" price={price} />
          ) : undefined}
        </StyledPriceBox>
      </StyledNodePoolSummaryBox>
    </>
  );
});
