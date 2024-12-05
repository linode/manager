import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Notice,
  TextField,
} from '@linode/ui';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { useUpdateOAuthClientMutation } from 'src/queries/account/oauth';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import type { OAuthClient, OAuthClientRequest } from '@linode/api-v4';

interface Props {
  client: OAuthClient | undefined;
  onClose: () => void;
  open: boolean;
}

export const EditOAuthClientDrawer = ({ client, onClose, open }: Props) => {
  const { error, isPending, mutateAsync, reset } = useUpdateOAuthClientMutation(
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
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
