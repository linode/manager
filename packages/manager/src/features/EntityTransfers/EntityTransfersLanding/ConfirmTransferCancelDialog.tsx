import { cancelTransfer } from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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

  const [submitting, setSubmitting] = React.useState(false);
  const [submissionErrors, setSubmissionErrors] = React.useState<
    APIError[] | null
  >(null);

  React.useEffect(() => {
    if (open) {
      setSubmissionErrors(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleCancelTransfer = () => {
    // This should never happen.
    if (!token) {
      return;
    }
    setSubmissionErrors(null);
    setSubmitting(true);
    cancelTransfer(token)
      .then(() => {
        onClose();
        setSubmitting(false);
        enqueueSnackbar('Transfer canceled successfully.', {
          variant: 'success'
        });
      })
      .catch(e => {
        setSubmissionErrors(
          getAPIErrorOrDefault(e, 'An unexpected error occurred.')
        );
        setSubmitting(false);
      });
  };

  const actions = (
    <ActionsPanel className={classes.actions}>
      <Button onClick={onClose} buttonType="cancel">
        Keep Transfer
      </Button>
      <Button
        disabled={submitting}
        onClick={handleCancelTransfer}
        loading={submitting}
        buttonType="primary"
      >
        Cancel Transfer
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      onClose={onClose}
      title="Are you sure you want to cancel this transfer?"
      open={open}
      actions={actions}
    >
      {// There could be multiple errors here that are relevant.
      submissionErrors
        ? submissionErrors.map((thisError, idx) => (
            <Notice
              key={`form-submit-error-${idx}`}
              error
              text={thisError.reason}
            />
          ))
        : null}
      <Typography>
        Explanatory text about what happens when you cancel a transfer...
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(ConfirmTransferCancelDialog);
