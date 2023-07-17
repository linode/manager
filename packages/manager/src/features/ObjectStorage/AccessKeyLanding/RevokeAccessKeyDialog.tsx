import { APIError } from '@linode/api-v4/lib/types';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

import { CancelNotice } from '../CancelNotice';

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
      <Button buttonType="secondary" data-qa-cancel onClick={handleClose}>
        Cancel
      </Button>
      <Button buttonType="primary" loading={isLoading} onClick={handleSubmit}>
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
