import { OAuthClient, OAuthClientRequest } from '@linode/api-v4';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { useUpdateOAuthClientMutation } from 'src/queries/accountOAuth';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

interface Props {
  client: OAuthClient | undefined;
  onClose: () => void;
  open: boolean;
}

export const EditOAuthClientDrawer = ({ client, onClose, open }: Props) => {
  const { error, isLoading, mutateAsync, reset } = useUpdateOAuthClientMutation(
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

  const hasErrorFor = getAPIErrorFor(errorResources, error ?? undefined);

  return (
    <Drawer onClose={onClose} open={open} title="Create OAuth App">
      {hasErrorFor('none') && (
        <Notice text={hasErrorFor('none')} variant="error" />
      )}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={hasErrorFor('label')}
          label="Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <TextField
          errorText={hasErrorFor('redirect_uri')}
          label="Callback URL"
          name="redirect_uri"
          onChange={formik.handleChange}
          value={formik.values.redirect_uri}
        />
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox checked={client?.public} disabled name="public" />
            }
            label="Public"
          />
        </FormControl>
        <ActionsPanel
          primaryButtonProps={{
            disabled: !formik.dirty,
            label: 'Save Changes',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
