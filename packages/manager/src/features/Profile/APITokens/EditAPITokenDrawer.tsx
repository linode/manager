import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import { useFormik } from 'formik';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useUpdatePersonalAccessTokenMutation } from 'src/queries/tokens';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  onClose: () => void;
  open: boolean;
  token: Token | undefined;
}

export const EditAPITokenDrawer = (props: Props) => {
  const { onClose, open, token } = props;

  const {
    error,
    isLoading,
    mutateAsync: updatePersonalAccessToken,
  } = useUpdatePersonalAccessTokenMutation(token?.id ?? -1);

  const form = useFormik<Partial<TokenRequest>>({
    enableReinitialize: true,
    initialValues: {
      label: token?.label,
    },
    async onSubmit(values) {
      await updatePersonalAccessToken(values);
      onClose();
    },
  });

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer onClose={onClose} open={open} title="Edit Personal Access Token">
      {errorMap.none && <Notice error text={errorMap.none} />}
      <TextField
        errorText={errorMap.label}
        label="Label"
        name="label"
        onChange={form.handleChange}
        value={form.values.label}
      />
      <ActionsPanel>
        <Button buttonType="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          data-testid="save-button"
          disabled={!form.dirty}
          loading={isLoading}
          onClick={() => form.handleSubmit()}
        >
          Save
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};
