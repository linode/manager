import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import { useFormik } from 'formik';
import { useUpdatePersonalAccessTokenMutation } from 'src/queries/tokens';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  token: Token | undefined;
}

export const EditAPITokenDrawer = (props: Props) => {
  const { open, onClose, token } = props;

  const {
    mutateAsync: updatePersonalAccessToken,
    isLoading,
    error,
  } = useUpdatePersonalAccessTokenMutation(token?.id ?? -1);

  const form = useFormik<Partial<TokenRequest>>({
    initialValues: {
      label: token?.label,
    },
    enableReinitialize: true,
    async onSubmit(values) {
      await updatePersonalAccessToken(values);
      onClose();
    },
  });

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer title="Edit Personal Access Token" open={open} onClose={onClose}>
      {errorMap.none && <Notice error text={errorMap.none} />}
      <TextField
        errorText={errorMap.label}
        value={form.values.label}
        label="Label"
        name="label"
        onChange={form.handleChange}
      />
      <ActionsPanel>
        <Button buttonType="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          loading={isLoading}
          disabled={!form.dirty}
          onClick={() => form.handleSubmit()}
          data-testid="save-button"
        >
          Save
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};
