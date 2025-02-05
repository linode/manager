import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';

import type { RebuildLinodeFormValues } from './utils';

export const Image = () => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Controller
      render={({ field, fieldState }) => (
        <ImageSelect
          errorText={fieldState.error?.message}
          label="Image"
          noMarginTop
          onChange={(value) => field.onChange(value?.id ?? null)}
          value={field.value ?? null}
          variant="all"
        />
      )}
      control={control}
      name="image"
    />
  );
};
