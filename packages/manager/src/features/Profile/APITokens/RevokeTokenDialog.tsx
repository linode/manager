import { Token } from '@linode/api-v4/lib/profile/types';
import { useSnackbar } from 'notistack';
import React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import {
  useRevokeAppAccessTokenMutation,
  useRevokePersonalAccessTokenMutation,
} from 'src/queries/tokens';

import { APITokenType } from './APITokenTable';

export interface Props {
  onClose: () => void;
  open: boolean;
  token: Token | undefined;
  type: APITokenType;
}

export const RevokeTokenDialog = ({ onClose, open, token, type }: Props) => {
  const queryMap = {
    'OAuth Client Token': useRevokeAppAccessTokenMutation,
    'Personal Access Token': useRevokePersonalAccessTokenMutation,
  };

  const useRevokeQuery = queryMap[type];

  const { error, isLoading, mutateAsync } = useRevokeQuery(token?.id ?? -1);
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
      actions={
        <ActionsPanel>
          <Button
            buttonType="secondary"
            data-testid="cancel-button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-testid="revoke-button"
            loading={isLoading}
            onClick={onRevoke}
          >
            Revoke
          </Button>
        </ActionsPanel>
      }
      error={error?.[0].reason}
      onClose={onClose}
      open={open}
      title={`Revoke ${token?.label}?`}
    >
      <Typography>Are you sure you want to revoke this API Token?</Typography>
    </ConfirmationDialog>
  );
};
