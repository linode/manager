import { OAuthClientRequest } from '@linode/api-v4';
import { useFormik } from 'formik';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { useCreateOAuthClientMutation } from 'src/queries/accountOAuth';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

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
  const { error, isLoading, mutateAsync } = useCreateOAuthClientMutation();

  const formik = useFormik<OAuthClientRequest>({
    initialValues: {
      label: '',
      public: false,
      redirect_uri: '',
    },
    async onSubmit(values) {
      const data = await mutateAsync(values);
      onClose();
      showSecret(data.secret);
    },
  });

  const errorResources = {
    label: 'A label',
    redirect_uri: 'A callback URL',
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, error ?? undefined);

  return (
    <Drawer onClose={onClose} open={open} title="Create OAuth App">
      {hasErrorFor('none') && <Notice error text={hasErrorFor('none')} />}
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
        <ActionsPanel>
          <Button buttonType="secondary" className="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" loading={isLoading} type="submit">
            Create
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
