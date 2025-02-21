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
import { useCreateOAuthClientMutation } from 'src/queries/account/oauth';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import type { OAuthClientRequest } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  showSecret: (s: string) => void;
}

export const CreateOAuthClientDrawer = ({
  onClose,
  open,
  showSecret,
}: Props) => {
  const { error, isPending, mutateAsync } = useCreateOAuthClientMutation();

  const formik = useFormik<OAuthClientRequest>({
    initialValues: {
      label: '',
      public: true,
      redirect_uri: '',
    },
    async onSubmit(values) {
      const data = await mutateAsync(values);
      onClose();
      showSecret(data.secret);
    },
  });

  React.useEffect(() => {
    if (open) {
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
              <Checkbox
                checked={formik.values.public}
                name="public"
                onChange={formik.handleChange}
              />
            }
            label="Public"
          />
        </FormControl>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Create',
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
