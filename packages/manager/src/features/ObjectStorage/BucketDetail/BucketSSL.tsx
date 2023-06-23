import { ObjectStorageBucketSSLRequest } from '@linode/api-v4/lib/object-storage';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import ExternalLink from 'src/components/ExternalLink';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import {
  useBucketSSLDeleteMutation,
  useBucketSSLMutation,
  useBucketSSLQuery,
} from 'src/queries/objectStorage';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  StyledCertWrapper,
  StyledFieldsWrapper,
  StyledHelperText,
  StyledKeyWrapper,
} from './BucketSSL.styles';

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketSSL = (props: Props) => {
  const { bucketName, clusterId } = props;
  const theme = useTheme();

  return (
    <Paper sx={{ padding: theme.spacing(3) }}>
      <Typography variant="h2">SSL/TLS Certificate</Typography>
      <StyledHelperText>
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
      </StyledHelperText>
      <SSLBody bucketName={bucketName} clusterId={clusterId} />
    </Paper>
  );
};

export const SSLBody = (props: Props) => {
  const { bucketName, clusterId } = props;
  const { data, isLoading, error } = useBucketSSLQuery(clusterId, bucketName);
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
  const { mutateAsync, isLoading, error } = useBucketSSLMutation(
    clusterId,
    bucketName
  );

  const formik = useFormik<ObjectStorageBucketSSLRequest>({
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
        <Notice error text={errorMap.none} spacingTop={8} spacingBottom={0} />
      )}
      <StyledFieldsWrapper>
        <StyledCertWrapper xs={12} md={6}>
          <TextField
            label="Certificate"
            name="certificate"
            onChange={formik.handleChange}
            value={formik.values.certificate}
            multiline
            fullWidth={false}
            rows="3"
            data-testid="ssl-cert-input"
            errorText={errorMap.certificate}
            sx={{ '& > div': { minWidth: '100%' } }}
          />
        </StyledCertWrapper>
        <StyledKeyWrapper xs={12} md={6}>
          <TextField
            label="Private Key"
            name="private_key"
            fullWidth
            onChange={formik.handleChange}
            value={formik.values.private_key}
            multiline
            rows="3"
            data-testid="ssl-cert-input"
            errorText={errorMap.private_key}
            sx={{ '& > div': { minWidth: '100%' } }}
          />
        </StyledKeyWrapper>
      </StyledFieldsWrapper>
      <Grid>
        <ActionsPanel>
          <Button loading={isLoading} buttonType="primary" type="submit">
            Upload Certificate
          </Button>
        </ActionsPanel>
      </Grid>
    </form>
  );
};

const RemoveCertForm = (props: Props) => {
  const { bucketName, clusterId } = props;
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    mutateAsync: deleteSSLCert,
    isLoading,
    error,
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
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={() => setOpen(false)}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={removeCertificate}
        loading={isLoading}
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
        title="Remove TLS certificate"
        open={open}
        onClose={() => setOpen(false)}
        actions={actions}
        error={error?.[0].reason}
      >
        <Typography>
          Are you sure you want to remove all certificates from this Bucket?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};
