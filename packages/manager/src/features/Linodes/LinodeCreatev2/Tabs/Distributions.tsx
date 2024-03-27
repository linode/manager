import React from 'react';
import { useController } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Distributions = () => {
  const { field, fieldState } = useController<CreateLinodeRequest>({
    name: 'image',
  });

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <Paper>
      <Typography variant="h2">Choose a Distribution</Typography>
      <ImageSelectv2
        disabled={isCreateLinodeRestricted}
        errorText={fieldState.error?.message}
        onChange={(_, image) => field.onChange(image?.id ?? null)}
        value={field.value}
        variant="public"
      />
    </Paper>
  );
};
