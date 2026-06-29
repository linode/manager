import { useDeleteTokenFromShareGroupMutation } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { CANCEL_MEMBERSHIP_REQUEST_DIALOG_COPY } from '../constants';

import type { LEAVE_GROUP_DIALOG_PENDO_IDS } from '../constants';

type PendoIDs = {
  [K in keyof typeof LEAVE_GROUP_DIALOG_PENDO_IDS]: string;
};
interface LeaveGroupOrCancelRequestDialogProps {
  groupName: string;
  isCancelRequestDialog?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  pendoIDs: PendoIDs;
  tokenUuid: string;
}

export const LeaveGroupOrCancelRequestDialog = (
  props: LeaveGroupOrCancelRequestDialogProps
) => {
  const {
    groupName,
    isCancelRequestDialog,
    onClose,
    onSuccess,
    open,
    pendoIDs,
    tokenUuid,
  } = props;

  const {
    mutateAsync: deleteTokenFromShareGroup,
    isPending,
    error,
  } = useDeleteTokenFromShareGroupMutation({
    onSuccess() {
      enqueueSnackbar(
        !isCancelRequestDialog
          ? `Token removed from ${groupName} successfully.`
          : 'Membership request canceled.',
        {
          variant: 'success',
        }
      );

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm-leave-group',
        'data-pendo-id': pendoIDs.confirmButton,
        label: isCancelRequestDialog
          ? 'Cancel Membership Request'
          : 'Leave Share Group',
        loading: isPending,
        onClick: () => deleteTokenFromShareGroup({ tokenUuid }),
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel-leave-group',
        'data-pendo-id': pendoIDs.cancelButton,
        label: isCancelRequestDialog
          ? 'Keep Membership Request'
          : 'Stay in the Group',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      closeIconPendoId={pendoIDs.xButton}
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={
        isCancelRequestDialog
          ? 'Cancel membership request'
          : `Leave ${groupName}`
      }
    >
      {isCancelRequestDialog
        ? CANCEL_MEMBERSHIP_REQUEST_DIALOG_COPY
        : `Are you sure you want to leave share group ${groupName}? You will no longer
      have access to all shared images in this group. To join the share group,
      you will need to create a new membership request and share the new token
      with the receiving party.`}
    </ConfirmationDialog>
  );
};
