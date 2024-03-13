import React from 'react';
import { useController } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelect/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Distributions = () => {
  const { field, fieldState } = useController<CreateLinodeRequest>({
    name: 'image',
  });

  console.log("distros re-rendered")

  return (
    <Paper>
      <Typography variant="h2">Choose a Distribution</Typography>
      <ImageSelectv2
        errorText={fieldState.error?.message}
        onChange={(_, image) => field.onChange(image?.id)}
        value={field.value}
        variant="public"
      />
    </Paper>
  );
};
