import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { useFormik } from 'formik';
import { useUpdateOAuthClientMutation } from 'src/queries/accountOAuth';
import { OAuthClient, OAuthClientRequest } from '@linode/api-v4';

interface Props {
  open: boolean;
  onClose: () => void;
  client: OAuthClient | undefined;
}

export const EditOAuthClientDrawer = ({ open, onClose, client }: Props) => {
  const { mutateAsync, error, isLoading, reset } = useUpdateOAuthClientMutation(
    client?.id ?? ''
  );

  const formik = useFormik<Partial<OAuthClientRequest>>({
    enableReinitialize: true,
    initialValues: {
      label: client?.label,
      redirect_uri: client?.redirect_uri,
    },
    async onSubmit(values) {
      await mutateAsync(values);
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      reset();
      formik.resetForm();
    }
  }, [open]);

  const errorResources = {
    label: 'A label',
    redirect_uri: 'A callback URL',
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, error ?? undefined);

  return (
    <Drawer title="Create OAuth App" open={open} onClose={onClose}>
      {hasErrorFor('none') && <Notice text={hasErrorFor('none')} error />}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          name="label"
          errorText={hasErrorFor('label')}
          label="Label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <TextField
          name="redirect_uri"
          label="Callback URL"
          errorText={hasErrorFor('redirect_uri')}
          value={formik.values.redirect_uri}
          onChange={formik.handleChange}
        />
        <FormControl>
          <FormControlLabel
            label="Public"
            control={
              <CheckBox name="public" checked={client?.public} disabled />
            }
          />
        </FormControl>
        <ActionsPanel
          primary
          primaryButtonDisabled={!formik.dirty}
          primaryButtonLoading={isLoading}
          primaryButtonText=" Save Changes"
          primaryButtonType="submit"
          secondary
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      </form>
    </Drawer>
  );
};
