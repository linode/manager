import { acceptEntityTransfer } from '@linode/api-v4/lib/entity-transfers';
import { Checkbox, CircleProgress, ErrorState, Notice } from '@linode/ui';
import { capitalize, pluralize } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  TRANSFER_FILTERS,
  queryKey,
  useTransferQuery,
} from 'src/queries/entityTransfers';
import { useProfile } from '@linode/queries';
import { sendEntityTransferReceiveEvent } from 'src/utilities/analytics/customEventAnalytics';
import { parseAPIDate } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import { countByEntity } from '../utilities';
import {
  StyledActionsPanel,
  StyledDiv,
  StyledEntityTypography,
  StyledExpiryTypography,
  StyledSummaryTypography,
  StyledUl,
} from './ConfirmTransferDialog.styles';

import type { TransferEntities } from '@linode/api-v4/lib/entity-transfers';
import type { APIError } from '@linode/api-v4/lib/types';

export interface ConfirmTransferDialogProps {
  onClose: () => void;
  open: boolean;
  token?: string;
}

export const ConfirmTransferDialog = React.memo(
  (props: ConfirmTransferDialogProps) => {
    const { onClose, open, token } = props;
    const { enqueueSnackbar } = useSnackbar();
    const { data, error, isError, isLoading } = useTransferQuery(
      token ?? '',
      open
    );

    const [hasConfirmed, setHasConfirmed] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [submissionErrors, setSubmissionErrors] = React.useState<
      APIError[] | null
    >(null);

    const queryClient = useQueryClient();

    const isOwnAccount = Boolean(data?.is_sender);

    // If a user is trying to load their own account
    const errors = isOwnAccount
      ? [
          {
            reason:
              'You cannot initiate a transfer to another user on your account.',
          },
        ]
      : error;

    React.useEffect(() => {
      if (open) {
        setSubmissionErrors(null);
        setSubmitting(false);
        setHasConfirmed(false);
      }
    }, [open]);

    const handleAcceptTransfer = () => {
      // This should never happen.
      if (!token) {
        return;
      }
      setSubmissionErrors(null);
      setSubmitting(true);
      acceptEntityTransfer(token)
        .then(() => {
          // @analytics
          if (data?.entities) {
            const entityCount = countByEntity(data?.entities);
            sendEntityTransferReceiveEvent(entityCount);
          }
          // Update the received transfer table since we're already on the landing page
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === queryKey &&
              query.queryKey[2] === TRANSFER_FILTERS.received,
          });
          onClose();
          setSubmitting(false);
          enqueueSnackbar('Transfer accepted successfully.', {
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
      <StyledActionsPanel
        primaryButtonProps={{
          disabled: !hasConfirmed || isLoading || isError,
          label: 'Accept Transfer',
          loading: submitting,
          onClick: handleAcceptTransfer,
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      />
    );

    return (
      <ConfirmationDialog
        actions={actions}
        onClose={onClose}
        open={open}
        title="Receive a Service Transfer"
      >
        <DialogContent
          entities={data?.entities ?? { linodes: [] }}
          errors={errors}
          expiry={data?.expiry}
          handleToggleConfirm={() => setHasConfirmed((confirmed) => !confirmed)}
          hasConfirmed={hasConfirmed}
          isError={isError || isOwnAccount}
          isLoading={isLoading}
          onClose={onClose}
          onSubmit={handleAcceptTransfer}
          submissionErrors={submissionErrors}
        />
      </ConfirmationDialog>
    );
  }
);

interface ContentProps {
  entities: TransferEntities;
  errors: APIError[] | null;
  expiry?: string;
  handleToggleConfirm: () => void;
  hasConfirmed?: boolean;
  isError: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submissionErrors: APIError[] | null;
}

export const DialogContent = React.memo((props: ContentProps) => {
  const {
    entities,
    errors,
    expiry,
    handleToggleConfirm,
    hasConfirmed,
    isError,
    isLoading,
    submissionErrors,
  } = props;

  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <div style={{ width: 500 }}>
        <CircleProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ width: 500 }}>
        <ErrorState
          errorText={
            getAPIErrorOrDefault(
              errors ?? [],
              'Unable to load this transfer.'
            )[0].reason
          }
        />
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(expiry, profile?.timezone);

  return (
    <>
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
      <StyledDiv>
        <StyledSummaryTypography>
          This transfer contains:
        </StyledSummaryTypography>
        <StyledUl>
          {Object.keys(entities).map(
            (thisEntityType: keyof TransferEntities) => {
              // According to spec, all entity names are plural and lowercase
              // (NB: This may cause problems for NodeBalancers if/when they are added to the payload)
              const entityName = capitalize(thisEntityType).slice(0, -1);
              return (
                <li key={thisEntityType}>
                  <StyledEntityTypography>
                    <strong>
                      {pluralize(
                        entityName,
                        entityName + 's',
                        entities[thisEntityType].length
                      )}
                    </strong>
                  </StyledEntityTypography>
                </li>
              );
            }
          )}
        </StyledUl>
      </StyledDiv>
      {timeRemaining ? (
        <StyledExpiryTypography>{timeRemaining}</StyledExpiryTypography>
      ) : null}
      <div>
        <Checkbox
          checked={hasConfirmed}
          onChange={handleToggleConfirm}
          text="I accept responsibility for the billing of services listed above."
        />
      </div>
    </>
  );
});

export const getTimeRemaining = (
  time?: string,
  timezone?: string
): string | undefined => {
  if (!time) {
    return;
  }

  const minutesRemaining = Math.floor(
    parseAPIDate(time).diffNow('minutes').toObject().minutes ?? 0
  );

  if (minutesRemaining < 1) {
    // This should never happen; expired tokens have a status of STALE and can't be
    // retrieved by users on another account.
    return 'This token has expired.';
  }

  const unit = minutesRemaining > 60 ? 'hour' : 'minute';

  return `This token will expire in ${pluralize(
    unit,
    unit + 's',
    unit === 'minute' ? minutesRemaining : Math.round(minutesRemaining / 60)
  )} (${formatDate(time, {
    timezone,
  })}).`;
};
