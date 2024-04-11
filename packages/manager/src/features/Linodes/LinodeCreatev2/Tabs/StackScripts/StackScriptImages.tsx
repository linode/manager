import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useStackScriptQuery } from 'src/queries/stackscripts';

import type { CreateLinodeRequest, Image } from '@linode/api-v4';

export const StackScriptImages = () => {
  const stackscriptId = useWatch<CreateLinodeRequest, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const hasStackScriptSelected =
    stackscriptId !== null && stackscriptId !== undefined;

  const { data: stackscript } = useStackScriptQuery(
    stackscriptId ?? -1,
    hasStackScriptSelected
  );

  const shouldFilterImages = !stackscript?.images.includes('any/all');

  const imageSelectVariant = shouldFilterImages ? 'public' : 'all';

  const imageFilter = shouldFilterImages
    ? (image: Image) => stackscript?.images.includes(image.id) ?? false
    : undefined;

  const helperText = !hasStackScriptSelected
    ? 'Select a StackScript to see compatible Images.'
    : undefined;

  return (
    <Paper>
      <Typography variant="h2">Select an Image</Typography>
      <Controller<CreateLinodeRequest, 'image'>
        render={({ field, fieldState }) => (
          <ImageSelectv2
            disabled={!hasStackScriptSelected}
            errorText={fieldState.error?.message}
            filter={imageFilter}
            helperText={helperText}
            noOptionsText="No Compatible Images Available"
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
