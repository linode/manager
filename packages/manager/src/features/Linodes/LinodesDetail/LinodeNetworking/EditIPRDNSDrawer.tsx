import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useLinodeIPMutation } from 'src/queries/linodes/networking';
import { getErrorMap } from 'src/utilities/errorUtils';

import type { IPAddress } from '@linode/api-v4/lib/networking';

interface Props {
  ip: IPAddress | undefined;
  onClose: () => void;
  open: boolean;
}

export const EditIPRDNSDrawer = (props: Props) => {
  const { ip, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: updateIP,
    reset,
  } = useLinodeIPMutation();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      rdns: ip?.rdns,
    },
    async onSubmit(values) {
      await updateIP({
        address: ip?.address ?? '',
        rdns: values.rdns === '' ? null : values.rdns,
      });
      enqueueSnackbar(`Successfully updated RDNS for ${ip?.address}`, {
        variant: 'success',
      });
      onClose();
    },
  });

  const onExited = () => {
    formik.resetForm();
    reset();
  };

  const errorMap = getErrorMap(['rdns'], error);

  return (
    <Drawer
      onClose={onClose}
      onExited={onExited}
      open={open}
      title="Edit Reverse DNS"
    >
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && (
          <Notice variant="error">{errorMap.none}</Notice>
        )}
        <TextField
          data-qa-domain-name
          errorText={errorMap.rdns}
          helperText="Leave this field blank to reset RDNS"
          hideLabel
          label="Enter a domain name"
          name="rdns"
          onChange={formik.handleChange}
          placeholder="Enter a domain name"
          value={formik.values.rdns}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Save',
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
          style={{ marginTop: 16 }}
        />
      </form>
    </Drawer>
  );
};
