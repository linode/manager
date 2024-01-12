import { createLoadbalancerCertificate } from '@linode/api-v4';
import {
  CertificateEntrySchema,
  CreateCertificateSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Code } from 'src/components/Code/Code';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { CertificateSelect } from '../Certificates/CertificateSelect';

import type {
  CertificateConfig,
  CreateCertificatePayload,
} from '@linode/api-v4';
import {
  CERTIFICATES_COPY,
  exampleCert,
  exampleKey,
} from '../Certificates/constants';

interface Props {
  loadbalancerId: number;
  onAdd: (certificates: CertificateConfig) => void;
  onClose: () => void;
  open: boolean;
}

type Mode = 'existing' | 'new';

export const AddCertificateDrawer = (props: Props) => {
  const { onClose, open } = props;

  const [mode, setMode] = useState<Mode>('new');

  return (
    <Drawer onClose={onClose} open={open} title="Add Certificate">
      {/* @TODO Add AGLB docs link - M3-7041 */}
      <Typography>
        Input the host header that the Load Balancer will repsond to and the
        respective certificate to deliver. Use <Code>*</Code> as a wildcard
        apply to any host. <Link to="#">Learn more.</Link>
      </Typography>
      <RadioGroup onChange={(_, value) => setMode(value as Mode)} value={mode}>
        <FormControlLabel
          control={<Radio />}
          label="Create New Certificate"
          value="new"
        />
        <FormControlLabel
          control={<Radio />}
          label="Add Existing Certificate"
          value="existing"
        />
      </RadioGroup>
      {mode === 'existing' ? (
        <AddExistingCertificate {...props} />
      ) : (
        <AddNewCertificate {...props} />
      )}
    </Drawer>
  );
};

const AddExistingCertificate = (props: Props) => {
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

const AddNewCertificate = (props: Props) => {
  const { loadbalancerId, onAdd, onClose, open } = props;

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
    async onSubmit({ certificate, hostname, key, label, type }) {
      const cert = await createLoadbalancerCertificate(loadbalancerId, {
        certificate,
        key,
        label,
        type,
      });

      onAdd({ hostname, id: cert.id });
      onClose();
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

  return (
    <form onSubmit={formik.handleSubmit}>
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
