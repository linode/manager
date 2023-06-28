import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Typography } from 'src/components/Typography';
import { Button } from 'src/components/Button/Button';
import { APIError } from '@linode/api-v4/lib/types';
import { CancelNotice } from '../CancelNotice';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { styled } from '@mui/material/styles';

interface RevokeKeysDialogProps {
  errors?: APIError[];
  handleClose: () => void;
  handleSubmit: () => void;
  isLoading: boolean;
  isOpen: boolean;
  label: string;
  numAccessKeys: number;
}

export const RevokeAccessKeyDialog = (props: RevokeKeysDialogProps) => {
  const {
    errors,
    handleClose,
    handleSubmit,
    isLoading,
    isOpen,
    label,
    numAccessKeys,
  } = props;

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={handleSubmit} loading={isLoading}>
        Revoke
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={(errors || []).map((e) => e.reason).join(',')}
      onClose={handleClose}
      open={isOpen}
      title={`Revoking ${label}`}
    >
      <Typography>Are you sure you want to revoke this Access Key?</Typography>
      {/* If the user is attempting to revoke their last Access Key, remind them
      that they will still be billed unless they cancel Object Storage in
      Account Settings. */}
      {numAccessKeys === 1 && <StyledCancelNotice />}
    </ConfirmationDialog>
  );
};

export const StyledCancelNotice = styled(CancelNotice, {
  label: 'StyledCancelNotice',
})(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
