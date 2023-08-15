import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Code } from 'src/components/Code/Code';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useCreateSSHKeyMutation } from 'src/queries/profile';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const CreateSSHKeyDrawer = React.memo(({ onClose, open }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isLoading,
    mutateAsync: createSSHKey,
  } = useCreateSSHKeyMutation();

  const formik = useFormik<{ label: string; ssh_key: string }>({
    initialValues: {
      label: '',
      ssh_key: '',
    },
    async onSubmit(values) {
      await createSSHKey(values);
      enqueueSnackbar('Successfully created SSH key.', { variant: 'success' });
      formik.resetForm();
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

  const SSHTextAreaHelperText = () => (
    <Typography component="span">
      <Link to="https://www.linode.com/docs/guides/use-public-key-authentication-with-ssh/">
        Learn about
      </Link>{' '}
      uploading an SSH key or generating a new key pair. Note that the public
      key begins with <Code>ssh-rsa</Code> and ends with{' '}
      <Code>your_username@hostname</Code>.
    </Typography>
  );

  return (
    <Drawer onClose={onClose} open={open} title="Add SSH Key">
      {generalError && <Notice variant="error" text={generalError} />}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={hasErrorFor('label')}
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <TextField
          onBlur={(e) => {
            const trimmedValue = e.target.value.trim();
            formik.setFieldValue('ssh_key', trimmedValue);
            formik.handleBlur(e);
          }}
          errorText={hasErrorFor('ssh_key')}
          helperText={<SSHTextAreaHelperText />}
          label="SSH Public Key"
          multiline
          name="ssh_key"
          onChange={formik.handleChange}
          rows={1.75}
          value={formik.values.ssh_key}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add Key',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
});
