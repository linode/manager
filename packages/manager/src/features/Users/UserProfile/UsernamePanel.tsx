import { useUpdateUserMutation } from '@linode/queries';
import { Button, Paper, TextField } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';

import type { User } from '@linode/api-v4';

interface Props {
  user: User;
}

export const UsernamePanel = ({ user }: Props) => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const isProxyUserProfile = user?.user_type === 'proxy';

  const { mutateAsync } = useUpdateUserMutation(user.username);

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    defaultValues: { username: user.username },
    values: { username: user.username },
  });

  const onSubmit = async (values: Partial<User>) => {
    try {
      const user = await mutateAsync(values);

      // Because the username changed, we need to update the username in the URL
      history.replace(`/account/users/${user.username}`);

      enqueueSnackbar('Username updated successfully', { variant: 'success' });
    } catch (error) {
      setError('username', { message: error[0].reason });
    }
  };

  const tooltipForDisabledUsernameField = isProxyUserProfile
    ? RESTRICTED_FIELD_TOOLTIP
    : undefined;

  return (
    <Paper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState }) => (
            <TextField
              disabled={isProxyUserProfile}
              errorText={fieldState.error?.message}
              label="Username"
              noMarginTop
              onBlur={field.onBlur}
              onChange={field.onChange}
              tooltipText={tooltipForDisabledUsernameField}
              trimmed
              value={field.value}
            />
          )}
        />
        <Button
          buttonType="primary"
          disabled={!isDirty}
          loading={isSubmitting}
          sx={{ mt: 2 }}
          type="submit"
        >
          Save
        </Button>
      </form>
    </Paper>
  );
};
