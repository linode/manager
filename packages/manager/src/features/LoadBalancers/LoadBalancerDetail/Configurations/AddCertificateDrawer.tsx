import { CertificateEntrySchema } from '@linode/validation';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Code } from 'src/components/Code/Code';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { CertificateSelect } from '../Certificates/CertificateSelect';
import { CreateCertificateDrawer } from '../Certificates/CreateCertificateDrawer';

import type { CertificateConfig } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onAdd: (certificate: CertificateConfig) => void;
  onClose: () => void;
  open: boolean;
}

export const AddCertificateDrawer = (props: Props) => {
  const { loadbalancerId, onAdd, onClose, open } = props;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

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
    <Drawer onClose={onClose} open={open} title="Add Certificate">
      <Stack mb={1} spacing={2}>
        <Box>
          {/* @TODO Add AGLB docs link - M3-7041 */}
          <Typography>
            Input the host header that the Load Balancer will repsond to and the
            respective certificate to deliver. Use <Code>*</Code> as a wildcard
            apply to any host. <Link to="#">Learn more.</Link>
          </Typography>
        </Box>
        <Box>
          <LinkButton onClick={() => setIsCreateDrawerOpen(true)}>
            Create New Certificate
          </LinkButton>
        </Box>
      </Stack>
      <form onSubmit={formik.handleSubmit}>
        <CertificateSelect
          onChange={(certificate) =>
            formik.setFieldValue('id', certificate?.id ?? null)
          }
          textFieldProps={{
            onBlur: () => formik.setFieldTouched('id'),
          }}
          disableClearable
          errorText={formik.touched.id ? formik.errors.id : undefined}
          filter={{ type: 'downstream' }}
          loadbalancerId={loadbalancerId}
          value={formik.values.id}
        />
        <TextField
          errorText={
            formik.touched.hostname ? formik.errors.hostname : undefined
          }
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
      <CreateCertificateDrawer
        loadbalancerId={loadbalancerId}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSuccess={(certificate) => formik.setFieldValue('id', certificate.id)}
        open={isCreateDrawerOpen}
        type="downstream"
      />
    </Drawer>
  );
};
