import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ConfirmTransferDialog } from './ConfirmTransferDialog';
import {
  StyledLabelWrapperGrid,
  StyledReviewButton,
  StyledRootGrid,
  StyledTextField,
  StyledTransferButton,
  StyledTransferGrid,
  StyledTransferWrapperGrid,
  StyledTypography,
} from './TransferControls.styles';

export const TransferControls = React.memo(() => {
  const [token, setToken] = React.useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  const { push } = useHistory();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    // I don't love the UX here but it seems better than leaving a token in the input
    setTimeout(() => setToken(''), 150);
  };

  const handleCreateTransfer = () => push('/account/service-transfers/create');
  return (
    <>
      <StyledRootGrid
        alignItems="center"
        container
        justifyContent="space-between"
        spacing={2}
        wrap="nowrap"
      >
        <StyledLabelWrapperGrid alignItems="center" container wrap="nowrap">
          <StyledTypography>
            <strong>Receive a Service Transfer</strong>
          </StyledTypography>
          <StyledTransferWrapperGrid
            alignItems="center"
            container
            direction="row"
          >
            <StyledTextField
              hideLabel
              label="Receive a Service Transfer"
              onChange={handleInputChange}
              placeholder="Enter a token"
              value={token}
            />
            <StyledReviewButton
              buttonType="primary"
              disabled={token === ''}
              onClick={() => setConfirmDialogOpen(true)}
              tooltipText="Enter a service transfer token to review the details and accept the transfer."
            >
              Review Details
            </StyledReviewButton>
          </StyledTransferWrapperGrid>
        </StyledLabelWrapperGrid>
        <StyledTransferGrid>
          <StyledTransferButton
            buttonType="primary"
            onClick={handleCreateTransfer}
          >
            Make a Service Transfer
          </StyledTransferButton>
        </StyledTransferGrid>
      </StyledRootGrid>
      <ConfirmTransferDialog
        onClose={handleCloseDialog}
        open={confirmDialogOpen}
        token={token}
      />
    </>
  );
});
