import { useMutateProfile, useProfile } from '@linode/queries';
import {
  Autocomplete,
  Button,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

export const LishAuthMode = () => {
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  const { enqueueSnackbar } = useSnackbar();

  const thirdPartyEnabled = profile?.authentication_type !== 'password';

  const tooltipText = thirdPartyEnabled
    ? 'Password is disabled because Third-Party Authentication has been enabled.'
    : '';

  const modeOptions = [
    {
      label: 'Allow both password and key authentication',
      value: 'password_keys',
    },
    {
      label: 'Allow key authentication only',
      value: 'keys_only',
    },
    {
      label: 'Disable Lish',
      value: 'disabled',
    },
  ] as const;

  const values = {
    lish_auth_method: profile?.lish_auth_method ?? 'password_keys',
  };

  const form = useForm({
    values,
    defaultValues: values,
  });

  const onSubmit = async (value: typeof values) => {
    try {
      await updateProfile(value);

      enqueueSnackbar('LISH authentication mode updated successfully.', {
        variant: 'success',
      });
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <Paper>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h2">LISH Authentication Mode</Typography>
          {form.formState.errors.root?.message && (
            <Notice text={form.formState.errors.root.message} variant="error" />
          )}
          <Typography>
            This controls what authentication methods are allowed to connect to
            the Lish console servers.
          </Typography>
          <Controller
            control={form.control}
            name="lish_auth_method"
            render={({ field, fieldState }) => (
              <Autocomplete
                disableClearable
                errorText={fieldState.error?.message}
                getOptionDisabled={(option) =>
                  option.value === 'password_keys' &&
                  profile?.authentication_type !== 'password'
                }
                label="Authentication Mode"
                noMarginTop
                onChange={(e, option) => field.onChange(option.value)}
                options={modeOptions}
                textFieldProps={{
                  inputRef: field.ref,
                  tooltipText,
                }}
                value={modeOptions.find(
                  (option) => option.value === field.value
                )}
              />
            )}
          />
          <Stack alignItems="flex-end">
            <Button
              buttonType="primary"
              disabled={!form.formState.isDirty}
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};
