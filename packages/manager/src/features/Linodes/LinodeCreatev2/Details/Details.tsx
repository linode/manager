import { CreateLinodeRequest } from '@linode/api-v4';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Paper } from 'src/components/Paper';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

import { PlacementGroupPanel } from './PlacementGroupPanel';

export const Details = () => {
  const { control } = useFormContext<CreateLinodeRequest>();
  const flags = useFlags();

  const showPlacementGroups = Boolean(flags.placementGroups?.enabled);

  return (
    <Paper>
      <Typography variant="h2">Details</Typography>
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            errorText={fieldState.error?.message}
            label="Linode Label"
            onChange={field.onChange}
            value={field.value ?? ''}
          />
        )}
        control={control}
        name="label"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TagsInput
            value={
              field.value?.map((tag) => ({ label: tag, value: tag })) ?? []
            }
            onChange={(item) => field.onChange(item.map((i) => i.value))}
            tagError={fieldState.error?.message}
          />
        )}
        control={control}
        name="tags"
      />
      {showPlacementGroups && <PlacementGroupPanel />}
    </Paper>
  );
};
