import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
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
      <ActionsPanel
        primary
        primaryButtonDataTestId="save-button"
        primaryButtonDisabled={!form.dirty}
        primaryButtonHandler={form.handleSubmit}
        primaryButtonLoading={isLoading}
        primaryButtonText="Save"
        secondary
        secondaryButtonHandler={onClose}
        secondaryButtonText="Cancel"
      />
    </Drawer>
  );
};
