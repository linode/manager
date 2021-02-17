import { APIError } from '@linode/api-v4/lib/types';
import {
  acceptEntityTransfer,
  TransferEntities
} from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { useTransferQuery } from 'src/queries/entityTransfers';
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
  transferSummary: {
    marginBottom: theme.spacing()
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  expiry: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontSize: '1rem'
  },
  entityTypeDisplay: {
    marginBottom: theme.spacing()
  },
  summary: {
    fontSize: '1rem',
    marginBottom: 4
  },
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
    margin: 0
  }
}));

export interface Props {
  onClose: () => void;
  open: boolean;
  token?: string;
}

export const ConfirmTransferDialog: React.FC<Props> = props => {
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
        onClose();
        setSubmitting(false);
        enqueueSnackbar('Transfer accepted successfully.', {
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
        Cancel
      </Button>
      <Button
        disabled={!hasConfirmed || isLoading || isError}
        onClick={handleAcceptTransfer}
        loading={submitting}
        buttonType="primary"
      >
        Accept Transfer
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      onClose={onClose}
      title="Receive a Transfer"
      open={open}
      actions={actions}
    >
      <DialogContent
        isLoading={isLoading}
        isError={isError}
        errors={error}
        entities={data?.entities ?? { linodes: [] }}
        expiry={data?.expiry}
        hasConfirmed={hasConfirmed}
        handleToggleConfirm={() => setHasConfirmed(confirmed => !confirmed)}
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

export const DialogContent: React.FC<ContentProps> = React.memo(props => {
  const {
    entities,
    errors,
    expiry,
    hasConfirmed,
    handleToggleConfirm,
    isError,
    isLoading,
    submissionErrors
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
        <Typography className={classes.summary}>
          This transfer contains:
        </Typography>
        <ul className={classes.list}>
          {Object.keys(entities).map(thisEntityType => {
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
          text="I understand that I am responsible for any and all fees ipsum dolor sit amet"
        />
      </div>
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
