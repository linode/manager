import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerCertificateCreateMutation } from 'src/queries/aglb/certificates';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import {
  CERTIFICATES_COPY,
  exampleCert,
  exampleKey,
  labelMap,
  titleMap,
} from './constants';

import type { Certificate, CreateCertificatePayload } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  type: Certificate['type'];
}

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
    initialValues:
      type === 'ca'
        ? {
            certificate: '',
            label: '',
            type,
          }
        : {
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
        <Typography>{CERTIFICATES_COPY.Create[type]}</Typography>
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
          labelTooltipText={CERTIFICATES_COPY.Tooltips.Certificate}
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
            labelTooltipText={CERTIFICATES_COPY.Tooltips.Key}
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
