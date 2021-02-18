import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { queryClient } from 'src/queries/base';
import { useCancelTransfer } from 'src/queries/entityTransfers';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}));

export interface Props {
  onClose: () => void;
  open: boolean;
  token?: string;
}

export const ConfirmTransferCancelDialog: React.FC<Props> = props => {
  const { onClose, open, token } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: cancelTransfer, error, isLoading } = useCancelTransfer();

  const handleCancelTransfer = () => {
    // This should never happen.
    if (!token) {
      return;
    }

    cancelTransfer(token, {
      onSuccess: () => {
        // Refresh the query for Entity Transfers.
        queryClient.invalidateQueries('entity-transfers');

        onClose();
        enqueueSnackbar('Transfer canceled successfully.', {
          variant: 'success'
        });
      }
    });
  };

  const actions = (
    <ActionsPanel className={classes.actions}>
      <Button onClick={onClose} buttonType="cancel">
        Keep Transfer
      </Button>
      <Button
        disabled={isLoading}
        onClick={handleCancelTransfer}
        loading={isLoading}
        buttonType="primary"
      >
        Cancel Transfer
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      onClose={onClose}
      title="Cancel this transfer?"
      open={open}
      actions={actions}
    >
      {// There could be multiple errors here that are relevant.
      error
        ? error.map((err, idx) => (
            <Notice key={`form-submit-error-${idx}`} error text={err.reason} />
          ))
        : null}
      <Typography>
        Upon confirmation, the token generated for this transfer will no longer
        be valid. To transfer ownership of these Linodes, you will need to
        create a new transfer and share the new token with the receiving party.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(ConfirmTransferCancelDialog);
