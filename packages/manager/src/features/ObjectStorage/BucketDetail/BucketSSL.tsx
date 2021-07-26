import {
  deleteSSLCert,
  getSSLCert,
  uploadSSLCert,
} from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getErrorMap } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  button: {
    ...theme.applyLinkStyles,
  },
  helperText: {
    paddingTop: theme.spacing(),
    lineHeight: 1.5,
  },
  textArea: {
    minWidth: '100%',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexFlow: 'row wrap',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  certWrapper: {
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  keyWrapper: {
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
}));

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketSSL: React.FC<Props> = (props) => {
  const { bucketName, clusterId } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Typography variant="h2">SSL/TLS Certificate</Typography>
      <Typography className={classes.helperText}>
        Object Storage buckets are automatically served with a default TLS
        certificate that is valid for subdomains of linodeobjects.com. You can
        upload a custom certificate that will be used for the TLS portion of the
        HTTPS request instead. For more information, please see our guide on
        using{' '}
        <ExternalLink
          link="https://www.linode.com/docs/platform/object-storage/enable-ssl-for-object-storage/"
          hideIcon
          text="custom certificates for Object Storage buckets"
        />
        .
      </Typography>
      <SSLBody bucketName={bucketName} clusterId={clusterId} />
    </Paper>
  );
};

interface BodyProps {
  bucketName: string;
  clusterId: string;
}

export const SSLBody: React.FC<BodyProps> = (props) => {
  const { bucketName, clusterId } = props;

  const request = useAPIRequest(
    () => getSSLCert(clusterId, bucketName).then((response) => response.ssl),
    false
  );

  const hasSSL = request.data;

  if (request.loading) {
    return <CircleProgress />;
  }

  if (request.error) {
    return <ErrorState errorText="Error loading TLS cert data" />;
  }

  if (hasSSL) {
    return <RemoveCertForm {...props} update={request.update} />;
  }

  return <AddCertForm {...props} update={request.update} />;
};

export interface FormProps extends BodyProps {
  update: () => void;
}

export const AddCertForm: React.FC<FormProps> = (props) => {
  const { bucketName, clusterId, update } = props;
  const [certificate, setCertificate] = React.useState('');
  const [sslKey, setSSLKey] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);

  const errorMap = getErrorMap(['certificate', 'private_key'], error);

  const classes = useStyles();

  const onSubmit = () => {
    setSubmitting(true);
    setError(undefined);
    uploadSSLCert(clusterId, bucketName, { certificate, private_key: sslKey })
      .then((_) => {
        setSubmitting(false);
        update();
        setCertificate('');
        setSSLKey('');
      })
      .catch((error) => {
        setSubmitting(false);
        setError(error);
      });
  };

  return (
    <>
      {errorMap.none && (
        <Notice error text={errorMap.none} spacingTop={8} spacingBottom={0} />
      )}
      <div>
        <div className={classes.wrapper}>
          <Grid item xs={12} md={6} className={classes.certWrapper}>
            <TextField
              label="Certificate"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCertificate(e.target.value)
              }
              value={certificate}
              multiline
              fullWidth={false}
              rows="4"
              className={classes.textArea}
              data-testid="ssl-cert-input"
              errorText={errorMap.certificate}
            />
          </Grid>
          <Grid item xs={12} md={6} className={classes.keyWrapper}>
            <TextField
              label="Private Key"
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSSLKey(e.target.value)
              }
              value={sslKey}
              className={classes.textArea}
              multiline
              rows="4"
              data-testid="ssl-cert-input"
              errorText={errorMap.private_key}
            />
          </Grid>
        </div>
        <Grid item>
          <ActionsPanel>
            <Button
              onClick={onSubmit}
              loading={submitting}
              buttonType="primary"
            >
              Upload Certificate
            </Button>
          </ActionsPanel>
        </Grid>
      </div>
    </>
  );
};

export const RemoveCertForm: React.FC<FormProps> = (props) => {
  const { bucketName, clusterId, update } = props;
  const [open, setOpen] = React.useState(false);

  const [submittingDialog, setSubmittingDialog] = React.useState(false);
  const [dialogError, setDialogError] = React.useState<string | undefined>(
    undefined
  );

  const removeCertificate = () => {
    setSubmittingDialog(true);
    deleteSSLCert(clusterId, bucketName)
      .then(() => {
        setOpen(false);
        setSubmittingDialog(false);
        update();
      })
      .catch((error) => {
        setDialogError(error[0].reason);
        setSubmittingDialog(false);
      });
  };
  const createActions = () => (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={() => setOpen(false)}
        disabled={submittingDialog}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={removeCertificate}
        loading={submittingDialog}
      >
        Remove certificate
      </Button>
    </ActionsPanel>
  );
  return (
    <>
      <Notice success spacingTop={8}>
        A TLS certificate has already been uploaded for this Bucket. To upload a
        new certificate, remove the current certificate.{` `}
      </Notice>
      <Button buttonType="primary" onClick={() => setOpen(true)}>
        Remove Certificate
      </Button>
      <ConfirmationDialog
        title={'Remove TLS certificate'}
        open={open}
        onClose={() => setOpen(false)}
        actions={createActions()}
        error={dialogError}
      >
        <Typography>
          Are you sure you want to remove all certificates from this Bucket?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(BucketSSL);
