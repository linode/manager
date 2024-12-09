import { Notice, TextField } from '@linode/ui';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { useUpdateSSHKeyMutation } from 'src/queries/profile/profile';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import type { SSHKey } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  sshKey: SSHKey | undefined;
}

const EditSSHKeyDrawer = ({ onClose, open, sshKey }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
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
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};

export default React.memo(EditSSHKeyDrawer);
