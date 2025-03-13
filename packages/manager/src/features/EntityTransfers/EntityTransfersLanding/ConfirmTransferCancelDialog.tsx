import { cancelTransfer } from '@linode/api-v4/lib/entity-transfers';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { queryKey } from 'src/queries/entityTransfers';
import { sendEntityTransferCancelEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { TransferEntities } from '@linode/api-v4/lib/entity-transfers';
import type { APIError } from '@linode/api-v4/lib/types';

export interface Props {
  entities?: TransferEntities;
  onClose: () => void;
  open: boolean;
  token?: string;
}

export const ConfirmTransferCancelDialog = React.memo((props: Props) => {
  const { entities, onClose, open, token } = props;

  const { enqueueSnackbar } = useSnackbar();

  const [submitting, setSubmitting] = React.useState(false);
  const [submissionErrors, setSubmissionErrors] = React.useState<
    APIError[] | null
  >(null);

  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });

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
    <ActionsPanel
      primaryButtonProps={{
        disabled: submitting,
        label: 'Cancel Service Transfer',
        loading: submitting,
        onClick: handleCancelTransfer,
      }}
      secondaryButtonProps={{
        label: 'Keep Service Transfer',
        onClick: onClose,
      }}
      sx={{ display: 'flex', justifyContent: 'flex-end' }}
    />
  );

  // TS safety hatch (not possible in practice).
  if (!entities) {
    return null;
  }

  return (
    <ConfirmationDialog
      actions={actions}
      onClose={onClose}
      open={open}
      title="Cancel this Service Transfer?"
    >
      {
        // There could be multiple errors here that are relevant.
        submissionErrors
          ? submissionErrors.map((thisError, idx) => (
              <Notice
                key={`form-submit-error-${idx}`}
                text={thisError.reason}
                variant="error"
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
});
