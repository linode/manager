import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerCertificateDeleteMutation } from 'src/queries/aclb/certificates';

import type { Certificate } from '@linode/api-v4';

interface Props {
  certificate: Certificate | undefined;
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteCertificateDialog = (props: Props) => {
  const { certificate, loadbalancerId, onClose: _onClose, open } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerCertificateDeleteMutation(
    loadbalancerId,
    certificate?.id ?? -1
  );

  const onClose = () => {
    // Clear the error when the dialog closes so that is does not persist
    reset();
    _onClose();
  };

  const onDelete = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: 'Delete',
            loading: isLoading,
            onClick: onDelete,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      }
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
      title={`Delete Certificate ${certificate?.label}?`}
    >
      Are you sure you want to delete this certificate?
    </ConfirmationDialog>
  );
};
