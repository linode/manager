import { useAccountNetworkTransfer, useRegionsQuery } from '@linode/queries';
import { Box, CircleProgress, StyledLinkButton, Typography } from '@linode/ui';
import * as React from 'react';

import { StyledTransferDisplayContainer } from './TransferDisplay.styles';
import { TransferDisplayDialog } from './TransferDisplayDialog';
import {
  calculatePoolUsagePct,
  formatPoolUsagePct,
  getRegionTransferPools,
} from './utils';

export interface Props {
  spacingTop?: number;
}

export const TransferDisplay = React.memo(({ spacingTop }: Props) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const {
    data: generalPoolUsage,
    isError,
    isLoading,
  } = useAccountNetworkTransfer();
  const { data: regions } = useRegionsQuery();

  const generalPoolUsagePct = calculatePoolUsagePct(generalPoolUsage);
  const regionTransferPools = getRegionTransferPools(generalPoolUsage, regions);

  if (isError) {
    // We may want to add an error state for this but I think that would clutter
    // up the display.
    return null;
  }

  return (
    <Box marginTop={spacingTop}>
      <StyledTransferDisplayContainer>
        {isLoading ? (
          <>
            <Typography>Loading transfer data...</Typography>
            <CircleProgress size="sm" />
          </>
        ) : (
          <>
            <Typography>
              <StyledLinkButton
                aria-label="Show the Monthly Network Transfer Pool"
                data-testid="open-transfer-display-modal-button"
                onClick={() => setModalOpen(true)}
              >
                Monthly Network Transfer Pool
              </StyledLinkButton>
              &nbsp;usage:
            </Typography>
            <Typography data-testid="transfer-pool-pct-display">
              {formatPoolUsagePct(generalPoolUsagePct)} Global Transfer Pool
            </Typography>
            {regionTransferPools?.map((pool, key) => (
              <Typography
                data-testid="transfer-pool-pct-display"
                key={`transfer-pool-region-${key}`}
              >
                {`${formatPoolUsagePct(pool.pct)} ${pool.regionName}`}
              </Typography>
            ))}
          </>
        )}
      </StyledTransferDisplayContainer>
      <TransferDisplayDialog
        generalPoolUsage={generalPoolUsage ?? { quota: 0, used: 0 }}
        generalPoolUsagePct={generalPoolUsagePct ?? 0}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        regionTransferPools={regionTransferPools ?? []}
      />
    </Box>
  );
});
