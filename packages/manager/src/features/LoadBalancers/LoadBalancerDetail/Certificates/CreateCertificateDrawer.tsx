import { CreateCertificatePayload } from '@linode/api-v4';
import { Stack } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerCertificateCreateMutation } from 'src/queries/aglb/certificates';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const CreateCertificateDrawer = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open } = props;

  const onClose = () => {
    formik.resetForm();
    _onClose();
    reset();
  };

  const {
    error,
    mutateAsync: createCertificate,
    reset,
  } = useLoadBalancerCertificateCreateMutation(loadbalancerId);

  const formik = useFormik<CreateCertificatePayload>({
    initialValues: {
      certificate: '',
      key: '',
      label: '',
      type: 'downstream',
    },
    async onSubmit(values) {
      await createCertificate(values);
      onClose();
    },
  });

  const errorMap = getErrorMap(['label', 'key', 'certificate'], error);

  return (
    <Drawer onClose={onClose} open={open} title="Upload Certificate">
      <form onSubmit={formik.handleSubmit}>
        {errorMap.none && <Notice text={errorMap.none} variant="error" />}
        <Typography mb={2}>
          Upload the certificates for Load Balancer authentication.
        </Typography>
        <RadioGroup
          name="type"
          onChange={formik.handleChange}
          value={formik.values.type}
        >
          <FormControlLabel
            label={
              <Stack spacing={1}>
                <Typography>TLS Certificate</Typography>
                <Typography>
                  Used by your load balancer to terminate the connection and
                  decrypt request from client prior to sending the request to
                  the endpoints in your Service Targets. You can specify a Host
                  Header. Also referred to as SSL Certificate.
                </Typography>
              </Stack>
            }
            control={<Radio />}
            value="downstream"
          />
          <FormControlLabel
            label={
              <Stack spacing={1}>
                <Typography>Service Target Certificate</Typography>
                <Typography>
                  Used by the load balancer to accept responses from your
                  endpoints in your Service Target. This is the certificate
                  installed on your Endpoints.
                </Typography>
              </Stack>
            }
            control={<Radio />}
            sx={{ mt: 2 }}
            value="ca"
          />
        </RadioGroup>
        <TextField
          errorText={errorMap.label}
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <TextField
          errorText={errorMap.certificate}
          label="TLS Certificate"
          labelTooltipText="TODO"
          multiline
          name="certificate"
          onChange={formik.handleChange}
          value={formik.values.certificate}
        />
        <TextField
          errorText={errorMap.key}
          label="Private Key"
          labelTooltipText="TODO"
          multiline
          name="key"
          value={formik.values.key}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Upload Certificate',
            type: 'submit',
          }}
        />
      </form>
    </Drawer>
  );
};
