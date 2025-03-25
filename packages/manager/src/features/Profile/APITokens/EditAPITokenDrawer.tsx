import { useUpdatePersonalAccessTokenMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { useFormik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import { getErrorMap } from 'src/utilities/errorUtils';

import type { Token, TokenRequest } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  token: Token | undefined;
}

export const EditAPITokenDrawer = (props: Props) => {
  const { onClose, open, token } = props;

  const {
    error,
    isPending,
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
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Edit Personal Access Token"
    >
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      <TextField
        errorText={errorMap.label}
        label="Label"
        name="label"
        onChange={form.handleChange}
        value={form.values.label}
      />
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'save-button',
          disabled: !form.dirty,
          label: 'Save',
          loading: isPending,
          onClick: () => form.handleSubmit(),
        }}
        secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      />
    </Drawer>
  );
};
