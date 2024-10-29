import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useStackScriptQuery } from 'src/queries/stackscripts';

import { useLinodeCreateQueryParams } from '../../utilities';

import type { CreateLinodeRequest, Image } from '@linode/api-v4';

export const StackScriptImages = () => {
  const stackscriptId = useWatch<CreateLinodeRequest, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const { params } = useLinodeCreateQueryParams();

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
    ? `Select ${
        params.type === 'One-Click' ? 'an app' : 'a StackScript'
      } to see compatible Images.`
    : undefined;

  return (
    <Paper>
      <Typography variant="h2">Select an Image</Typography>
      <Controller<CreateLinodeRequest, 'image'>
        render={({ field, fieldState }) => (
          <ImageSelect
            disabled={!hasStackScriptSelected}
            errorText={fieldState.error?.message}
            filter={imageFilter}
            helperText={helperText}
            noOptionsText="No Compatible Images Available"
            onChange={(image) => field.onChange(image?.id ?? null)}
            selectIfOnlyOneOption
            value={field.value ?? null}
            variant={imageSelectVariant}
          />
        )}
        name="image"
      />
    </Paper>
  );
};
