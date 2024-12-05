import { Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { useLinodeCreateQueryParams } from '../utilities';
import { PlacementGroupPanel } from './PlacementGroupPanel';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Details = () => {
  const { control } = useFormContext<CreateLinodeRequest>();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();

  const { params } = useLinodeCreateQueryParams();

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
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value ?? ''}
          />
        )}
        control={control}
        name="label"
      />
      {params.type !== 'Clone Linode' && (
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
      )}
      {isPlacementGroupsEnabled && <PlacementGroupPanel />}
    </Paper>
  );
};
