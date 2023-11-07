import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerCertificateCreateMutation } from 'src/queries/aglb/certificates';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { labelMap } from './EditCertificateDrawer';

import type { Certificate, CreateCertificatePayload } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  type: Certificate['type'];
}

const titleMap: Record<Certificate['type'], string> = {
  ca: 'Upload Service Target Certificate',
  downstream: 'Upload TLS Certificate',
};

const descriptionMap: Record<Certificate['type'], string> = {
  ca:
    'For HTTPS, used by the load balancer to accept responses from your endpoints in your Service Target. This is the certificate installed on your endpoints.',
  downstream:
    'Used by your load balancer to terminate the connection and decrypt request from client prior to sending the request to the endpoints in your Service Targets. You can specify a Host Header. Also referred to as ‘SSL Certificate’.',
};

const exampleCert = `-----BEGIN CERTIFICATE-----
Paste .pem format
-----END CERTIFICATE-----
`;

const exampleKey = `-----BEGIN PRIVATE KEY-----
Paste .pem format
-----END PRIVATE KEY-----
`;

export const CreateCertificateDrawer = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open, type } = props;

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
    enableReinitialize: true,
    initialValues: {
      certificate: '',
      key: '',
      label: '',
      type,
    },
    async onSubmit(values) {
      try {
        await createCertificate(values);
        onClose();
      } catch (errors) {
        formik.setErrors(getFormikErrorsFromAPIErrors(errors));
        scrollErrorIntoView();
      }
    },
    // Disabling validateOnBlur and validateOnChange when an API error is shown prevents
    // all API errors from disappearing when one field is changed.
    validateOnBlur: !error,
    validateOnChange: !error,
  });

  const generalError = error?.find((e) => !e.field)?.reason;

  return (
    <Drawer onClose={onClose} open={open} title={titleMap[type] ?? ''} wide>
      <form onSubmit={formik.handleSubmit}>
        {generalError && <Notice text={generalError} variant="error" />}
        <Typography>{descriptionMap[type]}</Typography>
        <TextField
          errorText={formik.errors.label}
          expand
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <TextField
          errorText={formik.errors.certificate}
          expand
          label={labelMap[type]}
          labelTooltipText="TODO"
          multiline
          name="certificate"
          onChange={formik.handleChange}
          placeholder={exampleCert}
          trimmed
          value={formik.values.certificate}
        />
        {type === 'downstream' && (
          <TextField
            errorText={formik.errors.key}
            expand
            label="Private Key"
            labelTooltipText="TODO"
            multiline
            name="key"
            onChange={formik.handleChange}
            placeholder={exampleKey}
            trimmed
            value={formik.values.key}
          />
        )}
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
