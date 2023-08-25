import { Configuration } from '@linode/api-v4';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Code } from 'src/components/Code/Code';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { CertificateSelect } from '../Certificates/CertificateSelect';

interface Props {
  loadbalancerId: number;
  onAdd: (certificates: Configuration['certificates']) => void;
  onClose: () => void;
  open: boolean;
}

export const ApplyCertificatesDrawer = (props: Props) => {
  const { loadbalancerId, onAdd, onClose, open } = props;

  const formik = useFormik<{ certificates: Configuration['certificates'] }>({
    initialValues: {
      certificates: [
        {
          hostname: '',
          id: -1,
        },
      ],
    },
    onSubmit(values, helpers) {
      onAdd(values.certificates);
      onClose();
      helpers.resetForm();
    },
  });

  const onAddAnother = () => {
    formik.setFieldValue('certificates', [
      ...formik.values.certificates,
      {
        hostname: '',
        id: -1,
      },
    ]);
  };

  return (
    <Drawer onClose={onClose} open={open} title="Apply Certificates">
      <Typography>
        Input the host header that the Load Balancer will repsond to and the
        respective certificate to deliver. Use <Code>*</Code> as a wildcard
        apply to any host. <Link to="#">Learn more.</Link>
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        {formik.values.certificates.map(({ hostname, id }, index) => (
          <Box key={index}>
            <TextField
              onChange={(e) =>
                formik.setFieldValue(
                  `certificates.${index}.hostname`,
                  e.target.value
                )
              }
              label="Host Header"
              value={hostname}
            />
            <CertificateSelect
              onChange={(certificate) =>
                formik.setFieldValue(
                  `certificates.${index}.id`,
                  certificate?.id ?? null
                )
              }
              loadbalancerId={loadbalancerId}
              value={id}
            />
          </Box>
        ))}
        <Button buttonType="outlined" onClick={onAddAnother} sx={{ mt: 2 }}>
          Add Another
        </Button>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save',
            type: 'submit',
          }}
        />
      </form>
    </Drawer>
  );
};
