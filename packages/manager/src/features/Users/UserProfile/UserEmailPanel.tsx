import { Button, Paper, TextField } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';

import type { User } from '@linode/api-v4';

interface Props {
  user: User;
}

export const UserEmailPanel = ({ user }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const isProxyUserProfile = user?.user_type === 'proxy';

  const { mutateAsync: updateProfile } = useMutateProfile();

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
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

  const disabledReason = isProxyUserProfile
    ? RESTRICTED_FIELD_TOOLTIP
    : profile?.username !== user.username
    ? 'You can\u{2019}t change another user\u{2019}s email address.'
    : undefined;

  // This should be disabled if this is NOT the current user or if the proxy user is viewing their own profile.
  const disableEmailField =
    profile?.username !== user.username || isProxyUserProfile;

  return (
    <Paper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
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
          control={control}
          name="email"
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
