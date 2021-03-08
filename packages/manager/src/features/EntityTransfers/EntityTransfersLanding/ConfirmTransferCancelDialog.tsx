import {
  cancelTransfer,
  TransferEntities,
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/entityTransfers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendEntityTransferCancelEvent } from 'src/utilities/ga';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

export interface Props {
  onClose: () => void;
  open: boolean;
  token?: string;
  entities?: TransferEntities;
}

export const ConfirmTransferCancelDialog: React.FC<Props> = (props) => {
  const { onClose, open, token, entities } = props;

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
        // @analytics
        sendEntityTransferCancelEvent();

        // Refresh the query for Entity Transfers.
        queryClient.invalidateQueries(queryKey);

        onClose();
        setSubmitting(false);
        enqueueSnackbar('Service transfer canceled successfully.', {
          variant: 'success',
        });
      })
      .catch((e) => {
        setSubmissionErrors(
          getAPIErrorOrDefault(e, 'An unexpected error occurred.')
        );
        setSubmitting(false);
      });
  };

  const actions = (
    <ActionsPanel className={classes.actions}>
      <Button onClick={onClose} buttonType="cancel">
        Keep Service Transfer
      </Button>
      <Button
        disabled={submitting}
        onClick={handleCancelTransfer}
        loading={submitting}
        buttonType="primary"
      >
        Cancel Service Transfer
      </Button>
    </ActionsPanel>
  );

  // TS safety hatch (not possible in practice).
  if (!entities) {
    return null;
  }

  return (
    <ConfirmationDialog
      onClose={onClose}
      title="Cancel this Service Transfer?"
      open={open}
      actions={actions}
    >
      {
        // There could be multiple errors here that are relevant.
        submissionErrors
          ? submissionErrors.map((thisError, idx) => (
              <Notice
                key={`form-submit-error-${idx}`}
                error
                text={thisError.reason}
              />
            ))
          : null
      }
      <Typography>
        The token generated for this service transfer will no longer be valid.
        To transfer ownership of{' '}
        {entities?.linodes.length > 1 ? 'these Linodes' : 'this Linode'}, you
        will need to create a new service transfer and share the new token with
        the receiving party.
      </Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(ConfirmTransferCancelDialog);
