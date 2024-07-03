import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { getGeneratedLinodeLabel } from '../utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { Image } from '@linode/api-v4';

export const Distributions = () => {
  const {
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field, fieldState } = useController<LinodeCreateFormValues>({
    name: 'image',
  });

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const onChange = (image: Image | null) => {
    field.onChange(image?.id ?? null);

    if (!isLabelFieldDirty) {
      setValue(
        'label',
        getGeneratedLinodeLabel({ tab: 'Distributions', values: getValues() })
      );
    }
  };

  return (
    <Paper>
      <Typography variant="h2">Choose an OS</Typography>
      <ImageSelectv2
        disabled={isCreateLinodeRestricted}
        errorText={fieldState.error?.message}
        onBlur={field.onBlur}
        onChange={onChange}
        value={field.value}
        variant="public"
      />
    </Paper>
  );
};
