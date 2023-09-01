import * as React from 'react';

import { Box } from 'src/components/Box';
import { useAccountTransfer } from 'src/queries/accountTransfer';
import { useRegionsQuery } from 'src/queries/regions';

import { StyledLinkButton } from '../Button/StyledLinkButton';
import { StyledTransferDisplayTypography } from './TransferDisplay.styles';
import { TransferDisplayDialog } from './TransferDisplayDialog';
import { calculatePoolUsagePct, getRegionTransferPools } from './utils';

export interface Props {
  spacingTop?: number;
}

export const TransferDisplay = React.memo(({ spacingTop }: Props) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const { data: generalPoolUsage, isError, isLoading } = useAccountTransfer();
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
      <StyledTransferDisplayTypography>
        {isLoading ? (
          'Loading transfer data...'
        ) : (
          <>
            <StyledLinkButton onClick={() => setModalOpen(true)}>
              Monthly Network Transfer Pool
            </StyledLinkButton>
            &nbsp;usage: <br />
            {generalPoolUsagePct.toFixed(generalPoolUsagePct < 1 ? 2 : 0)}%
            General Transfer Pool
            <br />
            {regionTransferPools?.map((pool) => (
              <>
                {pool.pct.toFixed(pool.pct < 1 ? 2 : 0)}% {pool.regionName}
                <br />
              </>
            ))}
          </>
        )}
      </StyledTransferDisplayTypography>
      <TransferDisplayDialog
        generalPoolUsage={generalPoolUsage ?? { quota: 0, used: 0 }}
        generalPoolUsagePct={generalPoolUsagePct ?? 0}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
});
