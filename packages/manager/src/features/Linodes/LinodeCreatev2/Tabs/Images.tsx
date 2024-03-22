import React from 'react';
import { useController } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Images = () => {
  const { field, fieldState } = useController<CreateLinodeRequest>({
    name: 'image',
  });

  return (
    <Paper>
      <Typography variant="h2">Choose an Image</Typography>
      <ImageSelectv2
        errorText={fieldState.error?.message}
        onChange={(_, image) => field.onChange(image?.id ?? null)}
        value={field.value}
        variant="private"
      />
    </Paper>
  );
};
