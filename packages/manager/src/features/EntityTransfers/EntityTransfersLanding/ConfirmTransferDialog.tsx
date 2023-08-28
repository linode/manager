import {
  TransferEntities,
  acceptEntityTransfer,
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import {
  TRANSFER_FILTERS,
  queryKey,
  useTransferQuery,
} from 'src/queries/entityTransfers';
import { useProfile } from 'src/queries/profile';
import { sendEntityTransferReceiveEvent } from 'src/utilities/analytics';
import { capitalize } from 'src/utilities/capitalize';
import { parseAPIDate } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';

import { countByEntity } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  entityTypeDisplay: {
    marginBottom: theme.spacing(),
  },
  expiry: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  list: {
    listStyleType: 'none',
    margin: 0,
    paddingLeft: 0,
  },
  summary: {
    marginBottom: 4,
  },
  transferSummary: {
    marginBottom: theme.spacing(),
  },
}));

export interface Props {
  onClose: () => void;
  open: boolean;
  token?: string;
}

export const ConfirmTransferDialog: React.FC<Props> = (props) => {
  const { onClose, open, token } = props;
  const classes = useStyles();
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
    <ActionsPanel
      primaryButtonProps={{
        disabled: !hasConfirmed || isLoading || isError,
        label: 'Accept Transfer',
        loading: submitting,
        onClick: handleAcceptTransfer,
      }}
      className={classes.actions}
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
};

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

export const DialogContent: React.FC<ContentProps> = React.memo((props) => {
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
  const classes = useStyles();

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
      <div className={classes.transferSummary}>
        <Typography className={classes.summary}>
          This transfer contains:
        </Typography>
        <ul className={classes.list}>
          {Object.keys(entities).map((thisEntityType) => {
            // According to spec, all entity names are plural and lowercase
            // (NB: This may cause problems for NodeBalancers if/when they are added to the payload)
            const entityName = capitalize(thisEntityType).slice(0, -1);
            return (
              <li key={thisEntityType}>
                <Typography className={classes.entityTypeDisplay}>
                  <strong>
                    {pluralize(
                      entityName,
                      entityName + 's',
                      entities[thisEntityType].length
                    )}
                  </strong>
                </Typography>
              </li>
            );
          })}
        </ul>
      </div>
      {timeRemaining ? (
        <Typography className={classes.expiry}>{timeRemaining}</Typography>
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

export default React.memo(ConfirmTransferDialog);
