import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { useCreateSSHKeyMutation } from 'src/queries/profile';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SSHKeyCreationDrawer = ({ open, onClose }: Props) => {
  const { mutateAsync, isLoading, error } = useCreateSSHKeyMutation();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik<{ label: string; ssh_key: string }>({
    initialValues: {
      label: '',
      ssh_key: '',
    },
    async onSubmit(values) {
      await mutateAsync(values);
      enqueueSnackbar('Successfully created SSH key.', { variant: 'success' });
      onClose();
    },
  });

  const hasErrorFor = getAPIErrorFor(
    {
      label: 'Label',
      ssh_key: 'Public key',
    },
    error ?? undefined
  );

  const generalError = hasErrorFor('none');

  return (
    <Drawer open={open} title="Add SSH Key" onClose={onClose}>
      {generalError && <Notice error text={generalError} />}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={hasErrorFor('label')}
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <TextField
          errorText={hasErrorFor('ssh_key')}
          label="SSH Public Key"
          name="ssh_key"
          onChange={formik.handleChange}
          value={formik.values.ssh_key}
          multiline
          rows={1.75}
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
          >
            Add Key
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default SSHKeyCreationDrawer;
