import { Certificate, UpdateCertificatePayload } from '@linode/api-v4';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerCertificateMutation } from 'src/queries/aglb/certificates';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  certificate: Certificate | undefined;
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const labelMap: Record<Certificate['type'], string> = {
  ca: 'Server Certificate',
  downstream: 'TLS Certificate',
};

/* TODO: AGLB - Update with final copy. */
const descriptionMap: Record<Certificate['type'], string> = {
  ca: 'You can edit this cert here. Maybe something about service targets.',
  downstream:
    'You can edit this cert here. Perhaps something about the private key and the hos header and what it does.',
};

export const EditCertificateDrawer = (props: Props) => {
  const { certificate, loadbalancerId, onClose: _onClose, open } = props;

  const theme = useTheme();

  const {
    error,
    mutateAsync: updateCertificate,
    reset,
  } = useLoadBalancerCertificateMutation(loadbalancerId, certificate?.id ?? -1);

  const formik = useFormik<UpdateCertificatePayload>({
    enableReinitialize: true,
    initialValues: {
      certificate: '',
      key: '',
      label: certificate?.label ?? '',
      type: certificate?.type,
    },
    async onSubmit(values) {
      await updateCertificate(values);
      onClose();
    },
  });

  const errorFields = ['label', 'certificate'];

  if (certificate?.type === 'downstream') {
    errorFields.push('key');
  }

  const errorMap = getErrorMap(errorFields, error);

  const onClose = () => {
    formik.resetForm();
    _onClose();
    reset();
  };

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Edit ${certificate?.label ?? 'Certificate'}`}
    >
      {errorMap.none && <Notice variant="error">{errorMap.none}</Notice>}
      {!certificate ? (
        <Notice variant="error">Error loading certificate.</Notice>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          {errorMap.none && <Notice text={errorMap.none} variant="error" />}
          <Typography sx={{ marginBottom: theme.spacing(2) }}>
            {descriptionMap[certificate.type]}
          </Typography>
          <TextField
            errorText={errorMap.label}
            label="Certificate Label"
            name="label"
            onChange={formik.handleChange}
            value={formik.values.label}
          />
          <TextField
            errorText={errorMap.certificate}
            label={labelMap[certificate.type]}
            labelTooltipText="TODO: AGLB"
            multiline
            name="certificate"
            onChange={formik.handleChange}
            placeholder={certificate.certificate ?? ''}
            trimmed
            value={formik.values.certificate}
          />
          {certificate?.type === 'downstream' && (
            <TextField
              errorText={errorMap.key}
              label="Private Key"
              labelTooltipText="TODO: AGLB"
              multiline
              name="key"
              onChange={formik.handleChange}
              placeholder="Private key is redacted for security reasons."
              trimmed
              value={formik.values.key}
            />
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Update Certificate',
              type: 'submit',
            }}
          />
        </form>
      )}
    </Drawer>
  );
};
