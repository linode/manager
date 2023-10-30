import { SSHKey } from '@linode/api-v4';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useUpdateSSHKeyMutation } from 'src/queries/profile';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

interface Props {
  onClose: () => void;
  open: boolean;
  sshKey: SSHKey | undefined;
}

const EditSSHKeyDrawer = ({ onClose, open, sshKey }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isLoading,
    mutateAsync: updateSSHKey,
    reset,
  } = useUpdateSSHKeyMutation(sshKey?.id ?? -1);

  const formik = useFormik<{ label: string }>({
    enableReinitialize: true,
    initialValues: {
      label: sshKey?.label ?? '',
    },
    async onSubmit(values) {
      await updateSSHKey(values);
      enqueueSnackbar('Successfully updated SSH key.', { variant: 'success' });
      formik.resetForm();
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      formik.resetForm();
    }
  }, [open]);

  const hasErrorFor = getAPIErrorFor(
    {
      label: 'Label',
    },
    error ?? undefined
  );

  const generalError = hasErrorFor('none');

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Edit SSH Key ${sshKey?.label}`}
    >
      {generalError && <Notice text={generalError} variant="error" />}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={hasErrorFor('label')}
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled: !formik.dirty,
            label: 'Save',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};

export default React.memo(EditSSHKeyDrawer);
