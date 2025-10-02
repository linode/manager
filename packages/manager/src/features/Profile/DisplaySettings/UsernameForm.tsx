import { useProfile, useUpdateUserMutation } from '@linode/queries';
import { Button, TextField } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';
import { useDelegationUserType } from 'src/features/IAM/hooks/useDelegationUserType';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { SingleTextFieldFormContainer } from './TimezoneForm';

import type { Profile } from '@linode/api-v4';

type Values = Pick<Profile, 'username'>;

export const UsernameForm = () => {
  const { data: profile } = useProfile();
  const { mutateAsync: updateUser } = useUpdateUserMutation(
    profile?.username ?? ''
  );
  const { enqueueSnackbar } = useSnackbar();

  const values = { username: profile?.username ?? '' };

  const { data: permissions } = usePermissions('account', ['update_user']);

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<Values>({
    defaultValues: values,
    values,
  });

  const { isProxyUser } = useDelegationUserType();

  const tooltipForDisabledUsernameField = !permissions.update_user
    ? 'Restricted users cannot update their username. Please contact an account administrator.'
    : isProxyUser
      ? RESTRICTED_FIELD_TOOLTIP
      : undefined;

  const onSubmit = async (values: Values) => {
    try {
      await updateUser(values);
      enqueueSnackbar({
        message: 'Username updated successfully.',
        variant: 'success',
      });
    } catch (error) {
      setError('username', { message: error[0].reason });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SingleTextFieldFormContainer>
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState }) => (
            <TextField
              containerProps={{
                sx: {
                  width: '100%',
                },
              }}
              disabled={tooltipForDisabledUsernameField !== undefined}
              errorText={fieldState.error?.message}
              label="Username"
              noMarginTop
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
          sx={{ minWidth: 180 }}
          type="submit"
        >
          Update Username
        </Button>
      </SingleTextFieldFormContainer>
    </form>
  );
};
