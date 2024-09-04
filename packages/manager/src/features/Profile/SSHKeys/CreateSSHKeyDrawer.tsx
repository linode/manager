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
import { useCreateSSHKeyMutation } from 'src/queries/profile/profile';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const CreateSSHKeyDrawer = React.memo(({ onClose, open }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
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
      handleClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

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
    <Drawer
      onClose={handleClose}
      open={open}
      // Adding zIndex value so that the SSH drawer is not hidden behind the Rebuild Linode dialog, which prevented users from adding an SSH key
      sx={{ zIndex: 1300 }}
      title="Add SSH Key"
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
        <TextField
          errorText={hasErrorFor('ssh_key')}
          helperText={<SSHTextAreaHelperText />}
          label="SSH Public Key"
          multiline
          name="ssh_key"
          onBlur={(e) => handleFormikBlur(e, formik)}
          onChange={formik.handleChange}
          rows={1.75}
          value={formik.values.ssh_key}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add Key',
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: handleClose }}
        />
      </form>
    </Drawer>
  );
});
