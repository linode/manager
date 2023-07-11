import React from 'react';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Typography } from 'src/components/Typography';
import { Token } from '@linode/api-v4/lib/profile/types';
import { APITokenType } from './APITokenTable';
import {
  useRevokeAppAccessTokenMutation,
  useRevokePersonalAccessTokenMutation,
} from 'src/queries/tokens';
import { useSnackbar } from 'notistack';

export interface Props {
  open: boolean;
  onClose: () => void;
  token: Token | undefined;
  type: APITokenType;
}

export const RevokeTokenDialog = ({ open, onClose, token, type }: Props) => {
  const queryMap = {
    'OAuth Client Token': useRevokeAppAccessTokenMutation,
    'Personal Access Token': useRevokePersonalAccessTokenMutation,
  };

  const useRevokeQuery = queryMap[type];

  const { mutateAsync, isLoading, error } = useRevokeQuery(token?.id ?? -1);
  const { enqueueSnackbar } = useSnackbar();

  const onRevoke = () => {
    mutateAsync().then(() => {
      onClose();
      enqueueSnackbar(`Successfully revoked ${token?.label}`, {
        variant: 'success',
      });
    });
  };

  return (
    <ConfirmationDialog
      title={`Revoke ${token?.label}?`}
      open={open}
      actions={
        <ActionsPanel
          showPrimary
          primaryButtonDataTestId="revoke-button"
          primaryButtonHandler={onRevoke}
          primaryButtonLoading={isLoading}
          primaryButtonText="Revoke"
          showSecondary
          secondaryButtonDataTestId="cancel-button"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      }
      onClose={onClose}
      error={error?.[0].reason}
    >
      <Typography>Are you sure you want to revoke this API Token?</Typography>
    </ConfirmationDialog>
  );
};
