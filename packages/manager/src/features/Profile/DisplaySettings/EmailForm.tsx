import { yupResolver } from '@hookform/resolvers/yup';
import { useMutateProfile, useProfile } from '@linode/queries';
import { Button, TextField } from '@linode/ui';
import { UpdateUserEmailSchema } from '@linode/validation';
import { useSearch } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';

import { SingleTextFieldFormContainer } from './TimezoneForm';

import type { Profile } from '@linode/api-v4';

type Values = Pick<Profile, 'email'>;

export const EmailForm = () => {
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();
  const { enqueueSnackbar } = useSnackbar();

  const { focusEmail } = useSearch({ strict: false });
  const emailRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, [emailRef, focusEmail]);

  const values = { email: profile?.email ?? '' };

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<Values>({
    resolver: yupResolver(UpdateUserEmailSchema),
    defaultValues: values,
    values,
  });

  const tooltipForDisabledEmailField =
    profile?.user_type === 'proxy' ? RESTRICTED_FIELD_TOOLTIP : undefined;

  const onSubmit = async (values: Values) => {
    try {
      await updateProfile(values);
      enqueueSnackbar({
        message: 'Email updated successfully.',
        variant: 'success',
      });
    } catch (error) {
      setError('email', { message: error[0].reason });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SingleTextFieldFormContainer>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              containerProps={{
                sx: {
                  width: '100%',
                },
              }}
              disabled={tooltipForDisabledEmailField !== undefined}
              errorText={fieldState.error?.message}
              inputRef={emailRef}
              label="Email"
              noMarginTop
              onChange={field.onChange}
              tooltipText={tooltipForDisabledEmailField}
              trimmed
              type="email"
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
          Update Email
        </Button>
      </SingleTextFieldFormContainer>
    </form>
  );
};
