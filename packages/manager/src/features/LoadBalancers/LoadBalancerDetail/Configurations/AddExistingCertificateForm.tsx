import { CertificateEntrySchema } from '@linode/validation';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { TextField } from 'src/components/TextField';

import { CertificateSelect } from '../Certificates/CertificateSelect';

import type { AddCertificateDrawerProps } from './AddCertificateDrawer';
import type { CertificateConfig } from '@linode/api-v4';

export const AddExistingCertificateForm = (
  props: AddCertificateDrawerProps
) => {
  const { loadbalancerId, onAdd, onClose, open } = props;

  const formik = useFormik<CertificateConfig>({
    initialValues: {
      hostname: '',
      id: -1,
    },
    onSubmit(values) {
      onAdd(values);
      onClose();
    },
    validationSchema: CertificateEntrySchema,
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <CertificateSelect
        onChange={(certificate) =>
          formik.setFieldValue('id', certificate?.id ?? null)
        }
        textFieldProps={{
          noMarginTop: true,
          onBlur: () => formik.setFieldTouched('id'),
        }}
        errorText={formik.touched.id ? formik.errors.id : undefined}
        filter={{ type: 'downstream' }}
        loadbalancerId={loadbalancerId}
        value={formik.values.id}
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
          label: 'Add',
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
