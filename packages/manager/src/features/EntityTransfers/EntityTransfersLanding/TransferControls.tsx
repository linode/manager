import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

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

import type { PermissionType } from '@linode/api-v4';

interface Props {
  permissions: Partial<Record<PermissionType, boolean>>;
}

export const TransferControls = React.memo((props: Props) => {
  const { permissions } = props;

  const flags = useFlags();
  const [token, setToken] = React.useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    // I don't love the UX here but it seems better than leaving a token in the input
    setTimeout(() => setToken(''), 150);
  };

  const handleCreateTransfer = () =>
    navigate({
      to: flags?.iamRbacPrimaryNavChanges
        ? '/service-transfers/create'
        : '/account/service-transfers/create',
    });

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
              disabled={!permissions.accept_service_transfer}
              hideLabel
              label="Receive a Service Transfer"
              onChange={handleInputChange}
              placeholder="Enter a token"
              value={token}
            />
            <StyledReviewButton
              buttonType="primary"
              disabled={!permissions.accept_service_transfer || token === ''}
              onClick={() => setConfirmDialogOpen(true)}
              tooltipText={
                !permissions.accept_service_transfer
                  ? 'You do not have permission to receive service transfers.'
                  : 'Enter a service transfer token to review the details and accept the transfer.'
              }
            >
              Review Details
            </StyledReviewButton>
          </StyledTransferWrapperGrid>
        </StyledLabelWrapperGrid>
        <StyledTransferGrid>
          <StyledTransferButton
            buttonType="primary"
            disabled={!permissions.create_service_transfer}
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
