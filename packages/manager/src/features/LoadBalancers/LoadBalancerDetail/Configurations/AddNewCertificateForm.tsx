import {
  CertificateEntrySchema,
  CreateCertificateSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useLoadBalancerCertificateCreateMutation } from 'src/queries/aglb/certificates';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import {
  CERTIFICATES_COPY,
  exampleCert,
  exampleKey,
} from '../Certificates/constants';

import type { AddCertificateDrawerProps } from './AddCertificateDrawer';
import type {
  CertificateConfig,
  CreateCertificatePayload,
} from '@linode/api-v4';

export const AddNewCertificateForm = (props: AddCertificateDrawerProps) => {
  const { loadbalancerId, onAdd, onClose, open } = props;

  const {
    mutateAsync: createCertificate,
    error,
  } = useLoadBalancerCertificateCreateMutation(loadbalancerId);

  const formik = useFormik<
    CreateCertificatePayload & Omit<CertificateConfig, 'id'>
  >({
    initialValues: {
      certificate: '',
      hostname: '',
      key: '',
      label: '',
      type: 'downstream',
    },
    async onSubmit({ certificate, hostname, key, label, type }, helpers) {
      try {
        const cert = await createCertificate({
          certificate,
          key,
          label,
          type,
        });

        onAdd({ hostname, id: cert.id });
        onClose();
      } catch (error) {
        helpers.setErrors(getFormikErrorsFromAPIErrors(error));
      }
    },
    validationSchema: CertificateEntrySchema.omit(['id']).concat(
      CreateCertificateSchema
    ),
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  const generalError = error?.[0].reason;

  return (
    <form onSubmit={formik.handleSubmit}>
      {generalError && <Notice text={generalError} variant="error" />}
      <TextField
        errorText={formik.touched.label ? formik.errors.label : undefined}
        label="Certificate Label"
        name="label"
        noMarginTop
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.label}
      />
      <TextField
        errorText={
          formik.touched.certificate ? formik.errors.certificate : undefined
        }
        expand
        label="Certificate"
        labelTooltipText={CERTIFICATES_COPY.Tooltips.Certificate}
        multiline
        name="certificate"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        placeholder={exampleCert}
        trimmed
        value={formik.values.certificate}
      />
      <TextField
        errorText={formik.touched.key ? formik.errors.key : undefined}
        expand
        label="Private Key"
        labelTooltipText={CERTIFICATES_COPY.Tooltips.Key}
        multiline
        name="key"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        placeholder={exampleKey}
        trimmed
        value={formik.values.key}
      />
      <TextField
        errorText={formik.touched.hostname ? formik.errors.hostname : undefined}
        label="Host Header"
        name="hostname"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.hostname}
      />
      <ActionsPanel
        primaryButtonProps={{
          label: 'Create and Add',
          loading: formik.isSubmitting,
          type: 'submit',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </form>
  );
};
