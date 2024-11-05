import { Paper } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { Region } from '../Region';
import { getGeneratedLinodeLabel } from '../utilities';

import type { LinodeCreateFormValues } from '../utilities';
import type { Image } from '@linode/api-v4';

export const OperatingSystems = () => {
  const {
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const queryClient = useQueryClient();

  const { field, fieldState } = useController<LinodeCreateFormValues>({
    name: 'image',
  });

  const siteType = useWatch<LinodeCreateFormValues, 'site_type'>({
    name: 'site_type',
  });

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const onChange = async (image: Image | null) => {
    field.onChange(image?.id ?? null);

    if (!isLabelFieldDirty) {
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: 'OS',
        values: getValues(),
      });
      setValue('label', label);
    }
  };

  return (
    <Stack spacing={3}>
      <Region />
      <Paper>
        <Typography variant="h2">Choose an OS</Typography>
        <ImageSelect
          disabled={isCreateLinodeRestricted}
          errorText={fieldState.error?.message}
          label="Linux Distribution"
          onBlur={field.onBlur}
          onChange={onChange}
          placeholder="Choose a Linux distribution"
          siteType={siteType}
          value={field.value}
          variant="public"
        />
      </Paper>
    </Stack>
  );
};
