import { OAuthClientRequest } from '@linode/api-v4';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { useCreateOAuthClientMutation } from 'src/queries/accountOAuth';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

interface Props {
  open: boolean;
  onClose: () => void;
  showSecret: (s: string) => void;
}

export const CreateOAuthClientDrawer = ({
  open,
  onClose,
  showSecret,
}: Props) => {
  const { mutateAsync, error, isLoading } = useCreateOAuthClientMutation();

  const formik = useFormik<OAuthClientRequest>({
    initialValues: {
      label: '',
      redirect_uri: '',
      public: false,
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
              <CheckBox
                name="public"
                onChange={formik.handleChange}
                checked={formik.values.public}
              />
            }
          />
        </FormControl>
        <ActionsPanel>
          <Button onClick={onClose} buttonType="secondary" className="cancel">
            Cancel
          </Button>
          <Button buttonType="primary" type="submit" loading={isLoading}>
            Create
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
