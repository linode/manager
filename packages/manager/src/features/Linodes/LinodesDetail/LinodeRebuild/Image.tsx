import { useStackScriptQuery } from '@linode/queries';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';

import type { RebuildLinodeFormValues } from './utils';
import type { Image as ImageType, StackScript } from '@linode/api-v4';

interface Props {
  disabled: boolean;
}

export const Image = (props: Props) => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const stackscriptId = useWatch({
    control,
    name: 'stackscript_id',
  });

  const { data: stackscript, isLoading } = useStackScriptQuery(
    stackscriptId ?? -1,
    Boolean(stackscriptId)
  );

  return (
    <Controller
      control={control}
      name="image"
      render={({ field, fieldState }) => (
        <ImageSelect
          disabled={props.disabled}
          errorText={fieldState.error?.message}
          filter={getImageSelectFilter(stackscript)}
          label="Image"
          loading={isLoading}
          noMarginTop
          onChange={(value) => field.onChange(value?.id ?? null)}
          value={field.value ?? null}
          variant="all"
        />
      )}
    />
  );
};

function getImageSelectFilter(stackscript: StackScript | undefined) {
  if (!stackscript) {
    // If no StackScript is selected, we don't need to filter.
    return undefined;
  }
  if (stackscript && stackscript.images.includes('any/all')) {
    // If a StackScript is selected and it allows any image, we don't need to do any filtering.
    return undefined;
  }
  // If we made it here, a StackScript is selected. We only want to show images that a StackScript supports.
  return (image: ImageType) => stackscript?.images.includes(image.id);
}
