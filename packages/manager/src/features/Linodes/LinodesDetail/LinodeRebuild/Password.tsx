import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PasswordInput } from 'src/components/PasswordInput/PasswordInput';

import type { RebuildLinodeFormValues } from './utils';

export const Password = () => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Controller
      render={({ field, fieldState }) => (
        <PasswordInput
          autoComplete="off"
          errorText={fieldState.error?.message}
          helperText="Set a password for your rebuilt Linode."
          label="Root Password"
          noMarginTop
          onBlur={field.onBlur}
          onChange={field.onChange}
          placeholder="Enter a password."
          value={field.value ?? ''}
        />
      )}
      control={control}
      name="root_pass"
    />
  );
};
