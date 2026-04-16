import { yupResolver } from '@hookform/resolvers/yup';
import { useMutateProfile, useUpdateUserMutation } from '@linode/queries';
import { ActionsPanel, Drawer, TextField } from '@linode/ui';
import {
  UpdateUserEmailSchema,
  UpdateUserNameSchema,
} from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';

import { useDelegationRole } from '../../hooks/useDelegationRole';

import type { User } from '@linode/api-v4';

interface Props {
  activeUser: User;
  canUpdateUser: boolean;
  onClose: () => void;
  open: boolean;
}

export const EditUserDetailsDrawer = (props: Props) => {
  const { activeUser, canUpdateUser, onClose, open } = props;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { profileUserName } = useDelegationRole();

  const isProxyOrDelegateUserType =
    activeUser?.user_type === 'proxy' || activeUser?.user_type === 'delegate';

  const { mutateAsync: updateUsername } = useUpdateUserMutation(
    activeUser.username
  );
  const { mutateAsync: updateProfile } = useMutateProfile();

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm({
    resolver: yupResolver(UpdateUserNameSchema.concat(UpdateUserEmailSchema)),
    defaultValues: { username: activeUser.username, email: activeUser.email },
    values: { username: activeUser.username, email: activeUser.email },
  });

  const onSubmit = async (values: { email: string; username: string }) => {
    let hasError = false;

    if (values.username !== activeUser.username) {
      try {
        const user = await updateUsername({ username: values.username });
        navigate({
          to: '/iam/users/$username/details',
          params: { username: user.username },
        });
        enqueueSnackbar('Username updated successfully', {
          variant: 'success',
        });
      } catch (error) {
        setError('username', { message: error[0].reason });
        hasError = true;
      }
    }

    if (values.email !== activeUser.email) {
      try {
        await updateProfile({ email: values.email });
        enqueueSnackbar('Email updated successfully', { variant: 'success' });
      } catch (error) {
        setError('email', { message: error[0].reason });
        hasError = true;
      }
    }

    if (!hasError) {
      handleClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  let tooltipForDisabledUsernameField: string | undefined;
  if (!canUpdateUser) {
    tooltipForDisabledUsernameField =
      'Restricted users cannot update their username. Please contact an account administrator.';
  } else if (isProxyOrDelegateUserType) {
    tooltipForDisabledUsernameField = RESTRICTED_FIELD_TOOLTIP;
  }

  let emailDisabledReason: string | undefined;
  if (isProxyOrDelegateUserType) {
    emailDisabledReason = RESTRICTED_FIELD_TOOLTIP;
  } else if (profileUserName !== activeUser.username) {
    emailDisabledReason = 'You can’t change another user’s email address.';
  }

  const disableEmailField =
    profileUserName !== activeUser.username || isProxyOrDelegateUserType;

  return (
    <Drawer onClose={handleClose} open={open} title="Edit user details">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
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
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              disabled={disableEmailField}
              errorText={fieldState.error?.message}
              label="Email"
              onBlur={field.onBlur}
              onChange={field.onChange}
              tooltipText={emailDisabledReason}
              trimmed
              type="email"
              value={field.value}
            />
          )}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: !isDirty,
            label: 'Save',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
