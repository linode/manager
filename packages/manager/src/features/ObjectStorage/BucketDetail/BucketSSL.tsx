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
import Dialog from 'src/components/core/Dialog';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import { useAPIRequest } from 'src/hooks/useAPIRequest';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  banner: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontSize: '1rem'
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
      .then(response => {
        console.log(response);
        setSubmitting(false);
      })
      .catch(error => {
        console.error(error);
        setSubmitting(false);
        setError(error[0].reason);
      });
  };

  return (
    <>
      <TLSBanner
        hasSSL={request.data}
        loading={request.loading}
        bucketName={bucketName}
        clusterId={clusterId}
      />
      <Paper className={classes.root}>
        <Typography variant="h2">SSL/TLS Certificate</Typography>
        {error && <Notice error text={error} spacingTop={4} />}
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
    </>
  );
};

interface BannerProps {
  hasSSL: boolean;
  loading: boolean;
  bucketName: string;
  clusterId: string;
}

export const TLSBanner: React.FC<BannerProps> = props => {
  const { bucketName, clusterId, hasSSL } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const [submitting, setSubmitDialog] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const removeCertificate = () => {
    deleteSSLCert(clusterId, bucketName);
  };

  return (
    <>
      <Paper className={classes.banner}>
        <Typography>
          This bucket {hasSSL ? 'has' : 'does not have'} a TLS certificate
          available.
        </Typography>
        {hasSSL && (
          <Button onClick={() => setOpen(true)} buttonType="remove">
            Remove
          </Button>
        )}
      </Paper>
      <Dialog
        title={'Remove TLS certificate'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Typography>
          Are you sure you want to remove all certificates from this Bucket?
        </Typography>
        <ActionsPanel>
          <Button
            loading={submitting}
            onClick={removeCertificate}
            buttonType="remove"
          >
            Save
          </Button>
          <Button
            disabled={submitting}
            onClick={() => setOpen(false)}
            buttonType="secondary"
          >
            Reset Form
          </Button>
        </ActionsPanel>
      </Dialog>
    </>
  );
};

export default React.memo(BucketSSL);
