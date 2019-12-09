import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CancelNotice from '../CancelNotice';

const useStyles = makeStyles((theme: Theme) => ({
  cancelNotice: {
    marginTop: theme.spacing(1)
  }
}));

interface RevokeKeysDialogProps {
  label: string;
  isOpen: boolean;
  isLoading: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  numAccessKeys: number;
  errors?: APIError[];
}

export const RevokeAccessKeyDialog: React.StatelessComponent<
  RevokeKeysDialogProps
> = props => {
  const {
    label,
    isOpen,
    isLoading,
    handleClose,
    handleSubmit,
    numAccessKeys,
    errors
  } = props;

  const classes = useStyles();

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="secondary"
        destructive
        onClick={handleSubmit}
        loading={isLoading}
      >
        Revoke
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={handleClose}
      title={`Revoking ${label}`}
      actions={actions}
      error={(errors || []).map(e => e.reason).join(',')}
    >
      <Typography>Are you sure you want to revoke this Access Key?</Typography>
      {/* If the user is attempting to revoke their last Access Key, remind them
      that they will still be billed unless they cancel Object Storage in
      Account Settings. */}
      {numAccessKeys === 1 && <CancelNotice className={classes.cancelNotice} />}
    </ConfirmationDialog>
  );
};
export default RevokeAccessKeyDialog;
