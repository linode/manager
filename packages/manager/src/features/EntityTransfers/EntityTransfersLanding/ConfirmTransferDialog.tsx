import { APIError } from '@linode/api-v4/lib/types';
import {
  acceptEntityTransfer,
  TransferEntities
} from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';
import Dialog from 'src/components/Dialog';
import { useTransferQuery } from 'src/queries/transfers';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import { capitalize } from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';
import { formatDate } from 'src/utilities/formatDate';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import CheckBox from 'src/components/CheckBox';
import ErrorState from 'src/components/ErrorState';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import Notice from 'src/components/Notice';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme: Theme) => ({
  dialogContent: {
    padding: theme.spacing(2),
    width: '100%'
  },
  transferSummary: {
    marginBottom: theme.spacing()
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  expiry: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  entityTypeDisplay: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing()
  }
}));

interface Props {
  onClose: () => void;
  open: boolean;
  token?: string;
}

export type CombinedProps = Props;

export const ConfirmTransferDialog: React.FC<Props> = props => {
  const { onClose, open, token } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isError, error } = useTransferQuery(
    token ?? '',
    open
  );

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

  const handleAcceptTransfer = () => {
    // This should never happen.
    if (!token) {
      return;
    }
    setSubmissionErrors(null);
    setSubmitting(true);
    acceptEntityTransfer(token)
      .then(() => {
        setSubmitting(false);
        enqueueSnackbar('Transfer accepted successfully.', {
          variant: 'success'
        });
        onClose();
      })
      .catch(e => {
        setSubmissionErrors(
          getAPIErrorOrDefault(e, 'An unexpected error occurred.')
        );
        setSubmitting(false);
      });
  };

  return (
    <Dialog
      onClose={onClose}
      title="Receive a Transfer"
      open={open}
      className={classes.dialogContent}
    >
      <DialogContent
        isLoading={isLoading}
        isError={isError}
        errors={error}
        entities={data?.entities ?? { linodes: [] }}
        expiry={data?.expiry}
        isSubmitting={submitting}
        submissionErrors={submissionErrors}
        onClose={onClose}
        onSubmit={handleAcceptTransfer}
      />
    </Dialog>
  );
};

interface ContentProps {
  isLoading: boolean;
  isError: boolean;
  errors: APIError[] | null;
  entities: TransferEntities;
  expiry?: string;
  isSubmitting: boolean;
  submissionErrors: APIError[] | null;
  onClose: () => void;
  onSubmit: () => void;
}

export const DialogContent: React.FC<ContentProps> = React.memo(props => {
  const {
    entities,
    errors,
    expiry,
    isError,
    isLoading,
    isSubmitting,
    submissionErrors,
    onClose,
    onSubmit
  } = props;
  const classes = useStyles();
  const [hasConfirmed, setHasConfirmed] = React.useState(false);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (isError) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(errors ?? [], 'Unable to load this transfer.')[0]
            .reason
        }
      />
    );
  }

  const timeRemaining = getTimeRemaining(expiry);

  return (
    <>
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
      <div className={classes.transferSummary}>
        <Typography>This transfer contains:</Typography>
        {Object.keys(entities).map(thisEntityType => {
          // According to spec, all entity names are plural and lowercase
          // (NB: This will cause problems for NodeBalancers if/when they are added to the payload)
          const entityName = capitalize(thisEntityType).slice(0, -1);
          return (
            <Typography
              key={thisEntityType}
              className={classes.entityTypeDisplay}
            >
              <strong>
                {pluralize(
                  entityName,
                  entityName + 's',
                  entities[thisEntityType].length
                )}
              </strong>
            </Typography>
          );
        })}
      </div>
      {timeRemaining ? (
        <Typography className={classes.expiry}>{timeRemaining}</Typography>
      ) : null}
      <div>
        <CheckBox
          checked={hasConfirmed}
          onChange={() => setHasConfirmed(confirmed => !confirmed)}
          text="I understand that I am responsible for any and all fees ipsum dolor sit amet"
        />
      </div>

      <ActionsPanel className={classes.actions}>
        <Button onClick={onClose} buttonType="cancel">
          Cancel
        </Button>
        <Button
          disabled={!hasConfirmed}
          onClick={onSubmit}
          loading={isSubmitting}
          destructive
          buttonType="primary"
        >
          Accept Transfer
        </Button>
      </ActionsPanel>
    </>
  );
});

export const getTimeRemaining = (time?: string) => {
  if (!time) {
    return;
  }

  const minutesRemaining = Math.floor(
    DateTime.fromISO(time)
      .diffNow('minutes')
      .toObject().minutes ?? 0
  );

  const unit = minutesRemaining > 60 ? 'hour' : 'minute';

  return `This token will expire in ${pluralize(
    unit,
    unit + 's',
    unit === 'minute' ? minutesRemaining : Math.round(minutesRemaining / 60)
  )} (${formatDate(time)}).`;
};

export default React.memo(ConfirmTransferDialog);
