import * as React from 'react';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountTransfer } from 'src/queries/accountTransfer';
import { useRegionsQuery } from 'src/queries/regions';

import { StyledLinkButton } from '../Button/StyledLinkButton';
import { LegacyTransferDisplay } from './LegacyTransferDisplay';
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
  const { dcSpecificPricing } = useFlags();
  const { data: generalPoolUsage, isError, isLoading } = useAccountTransfer();
  const { data: regions } = useRegionsQuery();

  const generalPoolUsagePct = calculatePoolUsagePct(generalPoolUsage);
  const regionTransferPools = getRegionTransferPools(generalPoolUsage, regions);

  if (!dcSpecificPricing) {
    return <LegacyTransferDisplay spacingTop={spacingTop} />;
  }

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
            <CircleProgress mini />
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
