import {
  getSSLCert,
  deleteSSLCert,
  uploadSSLCert
} from '@linode/api-v4/lib/object-storage';

import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
// import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import { useAPIRequest } from 'src/hooks/useAPIRequest';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  button: {
    ...theme.applyLinkStyles
  }
}));

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketSSL: React.FC<Props> = props => {
  const { bucketName, clusterId } = props;
  const [certificate, setCertificate] = React.useState('');
  const [sslKey, setSSLKey] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const classes = useStyles();

  const request = useAPIRequest(
    () => getSSLCert(clusterId, bucketName).then(response => response.ssl),
    false
  );

  const onSubmit = () => {
    setSubmitting(true);
    setError(undefined);
    uploadSSLCert(clusterId, bucketName, { certificate, private_key: sslKey })
      .then(_ => {
        setSubmitting(false);
        request.update();
      })
      .catch(error => {
        setSubmitting(false);
        setError(error[0].reason);
      });
  };

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
        request.update();
      })
      .catch(error => {
        setDialogError(error[0].reason);
        setSubmittingDialog(false);
      });
  };

  const createActions = () => (
    <ActionsPanel>
      <Button
        loading={submittingDialog}
        onClick={removeCertificate}
        destructive
      >
        Remove certificate
      </Button>
      <Button
        disabled={submittingDialog}
        onClick={() => setOpen(false)}
        buttonType="secondary"
      >
        Cancel
      </Button>
    </ActionsPanel>
  );

  const hasSSL = request.data;

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h2">SSL/TLS Certificate</Typography>
        {error && <Notice error text={error} spacingTop={8} />}
        {!(request.loading || error) && (
          <Notice
            success={hasSSL}
            warning={!hasSSL}
            spacingTop={8}
            text={
              <>
                This bucket {hasSSL ? 'has' : 'does not have'} a TLS certificate
                available.{' '}
                {hasSSL ? (
                  <button
                    className={classes.button}
                    onClick={() => setOpen(true)}
                  >
                    Remove
                  </button>
                ) : null}
              </>
            }
          />
        )}
        <Typography>
          Object Storage buckets are automatically served with a default TLS
          certificate that is valid for subdomains of linodeobjects.com. You can
          upload a custom certificate that will be used for the TLS portion of
          the HTTPS request instead.
        </Typography>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              label="Certificate"
              onChange={(e: any) => setCertificate(e.target.value)}
              value={certificate}
              multiline
              fullWidth={false}
              rows="4"
              // className={classes.keyTextarea}
              data-testid="ssl-cert-input"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Private Key"
              onChange={(e: any) => setSSLKey(e.target.value)}
              value={sslKey}
              multiline
              rows="4"
              // className={classes.keyTextarea}
              data-testid="ssl-cert-input"
            />
          </Grid>
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
        </Grid>
      </Paper>
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
