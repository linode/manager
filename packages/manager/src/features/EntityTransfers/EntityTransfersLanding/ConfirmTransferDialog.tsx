import {
  acceptEntityTransfer,
  TransferEntities,
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import { queryClient } from 'src/queries/base';
import {
  queryKey,
  TRANSFER_FILTERS,
  useTransferQuery,
} from 'src/queries/entityTransfers';
import { capitalize } from 'src/utilities/capitalize';
import { parseAPIDate } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { sendEntityTransferReceiveEvent } from 'src/utilities/ga';
import { pluralize } from 'src/utilities/pluralize';
import { countByEntity } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  transferSummary: {
    marginBottom: theme.spacing(),
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  expiry: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  entityTypeDisplay: {
    marginBottom: theme.spacing(),
  },
  summary: {
    marginBottom: 4,
  },
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
    margin: 0,
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
  const { data, isLoading, isError, error } = useTransferQuery(
    token ?? '',
    open
  );

  const [hasConfirmed, setHasConfirmed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submissionErrors, setSubmissionErrors] = React.useState<
    APIError[] | null
  >(null);

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
    <ActionsPanel className={classes.actions}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleAcceptTransfer}
        disabled={!hasConfirmed || isLoading || isError}
        loading={submitting}
      >
        Accept Transfer
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      onClose={onClose}
      title="Receive a Service Transfer"
      open={open}
      actions={actions}
    >
      <DialogContent
        isLoading={isLoading}
        isError={isError || isOwnAccount}
        errors={errors}
        entities={data?.entities ?? { linodes: [] }}
        expiry={data?.expiry}
        hasConfirmed={hasConfirmed}
        handleToggleConfirm={() => setHasConfirmed((confirmed) => !confirmed)}
        submissionErrors={submissionErrors}
        onClose={onClose}
        onSubmit={handleAcceptTransfer}
      />
    </ConfirmationDialog>
  );
};

interface ContentProps {
  hasConfirmed?: boolean;
  isLoading: boolean;
  isError: boolean;
  errors: APIError[] | null;
  entities: TransferEntities;
  expiry?: string;
  submissionErrors: APIError[] | null;
  handleToggleConfirm: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const DialogContent: React.FC<ContentProps> = React.memo((props) => {
  const {
    entities,
    errors,
    expiry,
    hasConfirmed,
    handleToggleConfirm,
    isError,
    isLoading,
    submissionErrors,
  } = props;
  const classes = useStyles();

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

  const timeRemaining = getTimeRemaining(expiry);

  return (
    <>
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
        <CheckBox
          checked={hasConfirmed}
          onChange={handleToggleConfirm}
          text="I accept responsibility for the billing of services listed above."
        />
      </div>
    </>
  );
});

export const getTimeRemaining = (time?: string): string | undefined => {
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
  )} (${formatDate(time)}).`;
};

export default React.memo(ConfirmTransferDialog);
