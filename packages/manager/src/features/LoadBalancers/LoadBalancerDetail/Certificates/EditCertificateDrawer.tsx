import { CreateCertificatePayload } from '@linode/api-v4';
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
  certificateId: number | undefined;
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const EditCertificateDrawer = (props: Props) => {
  const { certificateId, loadbalancerId, onClose: _onClose, open } = props;

  const theme = useTheme();

  const onClose = () => {
    formik.resetForm();
    _onClose();
    reset();
  };

  const {
    error,
    mutateAsync: editCertificate,
    reset,
  } = useLoadBalancerCertificateMutation(loadbalancerId, certificateId ?? -1);

  const formik = useFormik<CreateCertificatePayload>({
    initialValues: {
      certificate: '',
      key: '',
      label: '',
      type: 'downstream',
    },
    async onSubmit(values) {
      await editCertificate(values);
      onClose();
    },
  });

  const errorMap = getErrorMap(['label', 'key', 'certificate'], error);

  return (
    <Drawer onClose={onClose} open={open} title="Edit Certificate">
      <form onSubmit={formik.handleSubmit}>
        {errorMap.none && <Notice text={errorMap.none} variant="error" />}
        <Typography sx={{ marginBottom: theme.spacing(2) }}>
          {/* TODO: AGLB - Update with final copy. */}
          You can edit this cert here. Maybe something about service targets.
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
          label="TLS Certificate"
          labelTooltipText="TODO: AGLB"
          multiline
          name="certificate"
          onChange={formik.handleChange}
          trimmed
          value={formik.values.certificate}
        />
        <TextField
          errorText={errorMap.key}
          label="Private Key"
          labelTooltipText="TODO: AGLB"
          multiline
          name="key"
          onChange={formik.handleChange}
          trimmed
          value={formik.values.key}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Update Certificate',
            type: 'submit',
          }}
        />
      </form>
    </Drawer>
  );
};
