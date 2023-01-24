import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { Token, TokenRequest } from '@linode/api-v4/lib/profile/types';
import { useFormik } from 'formik';
import { useUpdatePersonalAccessTokenMutation } from 'src/queries/profile';
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
    onSubmit(values) {
      updatePersonalAccessToken(values).then(() => {
        onClose();
      });
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
        data-qa-add-label
      />
      <ActionsPanel>
        <Button
          buttonType="secondary"
          key="cancel"
          onClick={onClose}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          key="create"
          buttonType="primary"
          loading={isLoading}
          disabled={!form.dirty}
          onClick={() => form.handleSubmit()}
          data-qa-submit
        >
          Save
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};
