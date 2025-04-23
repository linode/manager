import { useCreateSSHKeyMutation } from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Code } from 'src/components/Code/Code';
import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
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
      Paste your public key into this field. Supported key formats include
      Ed25519 and RSA and begin with <Code>ssh-rsa</Code>, <Code>ssh-dss</Code>,{' '}
      <Code>ecdsa-sha2-nistp</Code>, <Code>ssh-ed25519</Code>, or{' '}
      <Code>sk-ecdsa-sha2-nistp256</Code>.{' '}
      <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-ssh-keys#add-a-public-key">
        Learn more
      </Link>
      .
    </Typography>
  );

  return (
    <Drawer
      NotFoundComponent={NotFound}
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
