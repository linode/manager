import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import Link from 'src/components/Link';
import TextField from 'src/components/TextField';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';
import { useCreateSSHKeyMutation } from 'src/queries/profile';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateSSHKeyDrawer = React.memo(({ open, onClose }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    mutateAsync: createSSHKey,
    isLoading,
    error,
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
    <>
      <Link to="https://www.linode.com/docs/guides/use-public-key-authentication-with-ssh/">
        Learn about
      </Link>{' '}
      uploading an SSH key or generating a new key pair. Note that the public
      key begins with <StyledInlineCode>ssh-rsa</StyledInlineCode> and ends with{' '}
      <StyledInlineCode>your_username@hostname</StyledInlineCode>
    </>
  );

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
          helperText={<SSHTextAreaHelperText />}
          onBlur={(e) => {
            const trimmedValue = e.target.value.trim();
            formik.setFieldValue('ssh_key', trimmedValue);
            formik.handleBlur(e);
          }}
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
});

const StyledInlineCode = styled('span', {
  label: 'StyledInlineCode',
})(({ theme }) => ({
  display: 'inline',
  fontFamily: '"Ubuntu Mono", monospace, sans-serif',
  margin: '0 2px',
  backgroundColor: theme.color.grey5,
  padding: '0 4px',
}));
