import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useLoadBalancerCertificateDeleteMutation } from 'src/queries/aglb/certificates';

import type { Certificate } from '@linode/api-v4';

interface Props {
  certificate: Certificate | undefined;
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const DeleteCertificateDialog = (props: Props) => {
  const { certificate, loadbalancerId, onClose, open } = props;

  const {
    error,
    isLoading,
    mutateAsync,
  } = useLoadBalancerCertificateDeleteMutation(
    loadbalancerId,
    certificate?.id ?? -1
  );

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
