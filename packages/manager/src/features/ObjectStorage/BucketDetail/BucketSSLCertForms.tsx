import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from 'src/components/core/Typography';
import { APIError } from '@linode/api-v4/lib/types';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getErrorMap } from 'src/utilities/errorUtils';
import { Notice } from 'src/components/Notice/Notice';
import {
  deleteSSLCert,
  uploadSSLCert,
} from '@linode/api-v4/lib/object-storage';
import {
  StyledCertWrapper,
  StyledKeyWrapper,
  StyledTextArea,
  StyledWrapper,
} from './BucketSSLCertForms.styles';
import type { BucketSSLBodyProps } from './BucketSSLBody';

export interface BucketSSLFormProps extends BucketSSLBodyProps {
  update: () => void;
}

export const AddCertForm = (props: BucketSSLFormProps) => {
  const { bucketName, clusterId, update } = props;
  const [certificate, setCertificate] = React.useState('');
  const [sslKey, setSSLKey] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);
  const errorMap = getErrorMap(['certificate', 'private_key'], error);

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
        <StyledWrapper>
          <StyledCertWrapper xs={12} md={6}>
            <StyledTextArea
              label="Certificate"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCertificate(e.target.value)
              }
              value={certificate}
              multiline
              fullWidth={false}
              rows="4"
              data-testid="ssl-cert-input"
              errorText={errorMap.certificate}
            />
          </StyledCertWrapper>
          <StyledKeyWrapper xs={12} md={6}>
            <StyledTextArea
              label="Private Key"
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSSLKey(e.target.value)
              }
              value={sslKey}
              multiline
              rows="4"
              data-testid="ssl-cert-input"
              errorText={errorMap.private_key}
            />
          </StyledKeyWrapper>
        </StyledWrapper>
        <Grid>
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

export const RemoveCertForm = (props: BucketSSLFormProps) => {
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
