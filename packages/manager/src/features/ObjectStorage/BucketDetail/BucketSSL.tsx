import {
  ActionsPanel,
  Box,
  Button,
  CircleProgress,
  ErrorState,
  Notice,
  Paper,
  TextField,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import {
  useBucketSSLDeleteMutation,
  useBucketSSLMutation,
  useBucketSSLQuery,
} from 'src/queries/object-storage/queries';
import { getErrorMap } from 'src/utilities/errorUtils';

import type { CreateObjectStorageBucketSSLPayload } from '@linode/api-v4';

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketSSL = (props: Props) => {
  const { bucketName, clusterId } = props;

  return (
    <Paper>
      <Typography variant="h2">SSL/TLS Certificate</Typography>
      <Typography sx={{ mt: 1 }}>
        Object Storage buckets are automatically served with a default TLS
        certificate that is valid for subdomains of linodeobjects.com. You can
        upload a custom certificate that will be used for the TLS portion of the
        HTTPS request instead. For more information, please see our guide on
        using{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/configure-a-custom-domain-with-a-tls-ssl-certificate">
          custom certificates for Object Storage buckets
        </Link>
        .
      </Typography>
      <SSLBody bucketName={bucketName} clusterId={clusterId} />
    </Paper>
  );
};

export const SSLBody = (props: Props) => {
  const { bucketName, clusterId } = props;
  const { data, error, isLoading } = useBucketSSLQuery(clusterId, bucketName);
  const hasSSL = Boolean(data?.ssl);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (hasSSL) {
    return <RemoveCertForm {...props} />;
  }

  return <AddCertForm {...props} />;
};

const AddCertForm = (props: Props) => {
  const { bucketName, clusterId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { error, isPending, mutateAsync } = useBucketSSLMutation(
    clusterId,
    bucketName
  );

  const formik = useFormik<CreateObjectStorageBucketSSLPayload>({
    initialValues: {
      certificate: '',
      private_key: '',
    },
    async onSubmit(values) {
      await mutateAsync(values);
      enqueueSnackbar(
        `Successfully added certificate to bucket ${bucketName}`,
        { variant: 'success' }
      );
    },
  });

  const errorMap = getErrorMap(['certificate', 'private_key'], error);

  return (
    <form onSubmit={formik.handleSubmit}>
      {errorMap.none && (
        <Notice
          spacingBottom={0}
          spacingTop={8}
          text={errorMap.none}
          variant="error"
        />
      )}
      <Grid container spacing={2}>
        <Grid size={{ md: 6, xs: 12 }}>
          <TextField
            data-testid="ssl-cert-input"
            errorText={errorMap.certificate}
            expand
            fullWidth={false}
            label="Certificate"
            multiline
            name="certificate"
            onChange={formik.handleChange}
            rows="3"
            value={formik.values.certificate}
          />
        </Grid>
        <Grid size={{ md: 6, xs: 12 }}>
          <TextField
            data-testid="ssl-cert-input"
            errorText={errorMap.private_key}
            expand
            fullWidth
            label="Private Key"
            multiline
            name="private_key"
            onChange={formik.handleChange}
            rows="3"
            value={formik.values.private_key}
          />
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button buttonType="primary" loading={isPending} type="submit">
          Upload Certificate
        </Button>
      </Box>
    </form>
  );
};

const RemoveCertForm = (props: Props) => {
  const { bucketName, clusterId } = props;
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    mutateAsync: deleteSSLCert,
  } = useBucketSSLDeleteMutation(clusterId, bucketName);

  const removeCertificate = async () => {
    await deleteSSLCert();
    setOpen(false);
    enqueueSnackbar(
      `Successfully removed certificate from bucket ${bucketName}`,
      { variant: 'success' }
    );
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Remove certificate',
        loading: isPending,
        onClick: removeCertificate,
      }}
      secondaryButtonProps={{
        disabled: isPending,
        label: 'Cancel',
        onClick: () => setOpen(false),
      }}
    />
  );

  return (
    <>
      <Notice spacingTop={8} variant="info">
        A TLS certificate has already been uploaded for this Bucket. To upload a
        new certificate, remove the current certificate.{` `}
      </Notice>
      <Button buttonType="primary" onClick={() => setOpen(true)}>
        Remove Certificate
      </Button>
      <ConfirmationDialog
        actions={actions}
        error={error?.[0].reason}
        onClose={() => setOpen(false)}
        open={open}
        title="Remove TLS certificate"
      >
        <Typography>
          Are you sure you want to remove all certificates from this Bucket?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};
