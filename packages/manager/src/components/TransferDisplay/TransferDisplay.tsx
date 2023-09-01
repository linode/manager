import * as React from 'react';

import { Box } from 'src/components/Box';
import { useAccountTransfer } from 'src/queries/accountTransfer';

import { StyledLinkButton } from '../Button/StyledLinkButton';
import { StyledTransferDisplayTypography } from './TransferDisplay.styles';
import { TransferDisplayDialog } from './TransferDisplayDialog';

export interface Props {
  spacingTop?: number;
}

export const TransferDisplay = React.memo(({ spacingTop }: Props) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const { data, isError, isLoading } = useAccountTransfer();

  // console.log('data', data);

  const quota = data?.quota ?? 0;
  const used = data?.used ?? 0;

  // Usage percentage should not be 100% if there has been no usage or usage has not exceeded quota.
  const poolUsagePct =
    used < quota ? (used / quota) * 100 : used === 0 ? 0 : 100;

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
            You have used {poolUsagePct.toFixed(poolUsagePct < 1 ? 2 : 0)}% of
            your
            {`  `}
            <StyledLinkButton onClick={() => setModalOpen(true)}>
              Monthly Network Transfer Pool
            </StyledLinkButton>
            .
          </>
        )}
      </StyledTransferDisplayTypography>
      <TransferDisplayDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        poolUsagePct={poolUsagePct}
        quota={quota}
        used={used}
      />
    </Box>
  );
});
