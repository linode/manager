import { Box, Divider, Typography } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { pluralize } from 'src/utilities/pluralize';

import {
  StyledHeader,
  StyledIconButton,
  StyledNodePoolSummaryBox,
  StyledPriceBox,
} from './KubeCheckoutSummary.styles';

import type { ExtendedType } from 'src/utilities/extendType';

export interface Props {
  nodeCount: number;
  onRemove: () => void;
  poolType: ExtendedType | null;
  price?: null | number; // Can be undefined until a Region is selected.
  updateNodeCount: (count: number) => void;
}

export const NodePoolSummaryItem = React.memo((props: Props) => {
  const { nodeCount, onRemove, poolType, price, updateNodeCount } = props;

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
            <Close />
          </StyledIconButton>
        </Box>
        <Box mb={1.5} mt={2}>
          <EnhancedNumberInput
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
