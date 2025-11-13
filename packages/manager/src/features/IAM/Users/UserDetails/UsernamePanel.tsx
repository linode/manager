import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateUserMutation } from '@linode/queries';
import { Button, Paper, TextField } from '@linode/ui';
import { UpdateUserNameSchema } from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';

import type { User } from '@linode/api-v4';

interface Props {
  activeUser: User;
  canUpdateUser: boolean;
}

export const UsernamePanel = ({ activeUser, canUpdateUser }: Props) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isProxyUser = activeUser?.user_type === 'proxy';

  const { mutateAsync } = useUpdateUserMutation(activeUser.username);

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    resolver: yupResolver(UpdateUserNameSchema),
    defaultValues: { username: activeUser.username },
    values: { username: activeUser.username },
  });

  const onSubmit = async (values: Partial<User>) => {
    try {
      const user = await mutateAsync(values);

      // Because the username changed, we need to update the username in the URL
      navigate({
        to: '/iam/users/$username/details',
        params: { username: user.username },
      });

      enqueueSnackbar('Username updated successfully', { variant: 'success' });
    } catch (error) {
      setError('username', { message: error[0].reason });
    }
  };

  const tooltipForDisabledUsernameField = !canUpdateUser
    ? 'Restricted users cannot update their username. Please contact an account administrator.'
    : isProxyUser
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
              disabled={tooltipForDisabledUsernameField !== undefined}
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
          disabled={!isDirty || !canUpdateUser}
          loading={isSubmitting}
          sx={{ mt: 2 }}
          tooltipText={
            !canUpdateUser
              ? 'You do not have permission to update this user.'
              : undefined
          }
          type="submit"
        >
          Save
        </Button>
      </form>
    </Paper>
  );
};
