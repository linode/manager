import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { useUpdateSSHKeyMutation } from 'src/queries/profile';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { SSHKey } from '@linode/api-v4';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  sshKey: SSHKey | undefined;
  onClose: () => void;
}

const EditSSHKeyDrawer = ({ open, onClose, sshKey }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    mutateAsync: updateSSHKey,
    isLoading,
    error,
    reset,
  } = useUpdateSSHKeyMutation(sshKey?.id ?? -1);

  const formik = useFormik<{ label: string }>({
    initialValues: {
      label: sshKey?.label ?? '',
    },
    enableReinitialize: true,
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
      open={open}
      onClose={onClose}
      title={`Edit SSH Key ${sshKey?.label}`}
    >
      {generalError && <Notice error text={generalError} />}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={hasErrorFor('label')}
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            loading={isLoading}
            data-testid="submit"
            disabled={!formik.dirty}
          >
            Save
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default React.memo(EditSSHKeyDrawer);
