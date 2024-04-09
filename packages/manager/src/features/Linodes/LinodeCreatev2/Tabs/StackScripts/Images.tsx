import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useStackScriptQuery } from 'src/queries/stackscripts';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Images = () => {
  const stackscriptId = useWatch<CreateLinodeRequest>({
    name: 'stackscript_id',
  });

  const { data: stackscript } = useStackScriptQuery(
    stackscriptId,
    Boolean(stackscriptId)
  );

  const imageSelectVariant = stackscript?.images.includes('any/all')
    ? 'all'
    : 'public';

  return (
    <Paper>
      <Typography variant="h2">Select an Image</Typography>
      <Controller<CreateLinodeRequest, 'image'>
        render={({ field, fieldState }) => (
          <ImageSelectv2
            errorText={fieldState.error?.message}
            onChange={(e, image) => field.onChange(image?.id ?? null)}
            value={field.value}
            variant={imageSelectVariant}
          />
        )}
        name="image"
      />
    </Paper>
  );
};
