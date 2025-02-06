import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PasswordInput } from 'src/components/PasswordInput/PasswordInput';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  disabled: boolean;
}

export const Password = (props: Props) => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Controller
      render={({ field, fieldState }) => (
        <PasswordInput
          autoComplete="off"
          disabled={props.disabled}
          errorText={fieldState.error?.message}
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
