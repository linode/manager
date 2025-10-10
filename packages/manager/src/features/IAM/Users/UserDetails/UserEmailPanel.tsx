import { yupResolver } from '@hookform/resolvers/yup';
import { useMutateProfile } from '@linode/queries';
import { Button, Paper, TextField } from '@linode/ui';
import { UpdateUserEmailSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';

import { useDelegationRole } from '../../hooks/useDelegationRole';

import type { User } from '@linode/api-v4';

interface Props {
  canUpdateUser: boolean;
  user: User;
}

export const UserEmailPanel = ({ canUpdateUser, user }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isProxyUser, profileUserName } = useDelegationRole();

  const { mutateAsync: updateProfile } = useMutateProfile();

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    resolver: yupResolver(UpdateUserEmailSchema),
    defaultValues: { email: user.email },
    values: { email: user.email },
  });

  const onSubmit = async (values: { email: string }) => {
    try {
      await updateProfile(values);

      enqueueSnackbar('Email updated successfully', { variant: 'success' });
    } catch (error) {
      setError('email', { message: error[0].reason });
    }
  };

  const disabledReason = isProxyUser
    ? RESTRICTED_FIELD_TOOLTIP
    : profileUserName !== user.username
      ? 'You can\u{2019}t change another user\u{2019}s email address.'
      : undefined;

  // This should be disabled if this is NOT the current user or if the proxy user is viewing their own profile.
  const disableEmailField = profileUserName !== user.username || isProxyUser;

  return (
    <Paper>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              disabled={disableEmailField}
              errorText={fieldState.error?.message}
              label="Email"
              noMarginTop
              onBlur={field.onBlur}
              onChange={field.onChange}
              tooltipText={disabledReason}
              trimmed
              type="email"
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
