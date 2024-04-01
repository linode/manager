import { CreateLinodeRequest } from '@linode/api-v4';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Paper } from 'src/components/Paper';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { PlacementGroupPanel } from './PlacementGroupPanel';

export const Details = () => {
  const { control } = useFormContext<CreateLinodeRequest>();
  const flags = useFlags();

  const showPlacementGroups = Boolean(flags.placementGroups?.enabled);

  const isCreateLinodeRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <Paper>
      <Typography variant="h2">Details</Typography>
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            disabled={isCreateLinodeRestricted}
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
            disabled={isCreateLinodeRestricted}
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
