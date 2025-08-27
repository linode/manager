import { Paper, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';

import { useGetLinodeCreateType } from '../Tabs/utils/useGetLinodeCreateType';
import { PlacementGroupPanel } from './PlacementGroupPanel';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Details = () => {
  const { control } = useFormContext<CreateLinodeRequest>();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();

  const createType = useGetLinodeCreateType();

  const { data: permissions } = usePermissions('account', ['create_linode']);

  return (
    <Paper>
      <Typography variant="h2">Details</Typography>
      <Controller
        control={control}
        name="label"
        render={({ field, fieldState }) => (
          <TextField
            disabled={!permissions.create_linode}
            errorText={fieldState.error?.message}
            label="Linode Label"
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value ?? ''}
          />
        )}
      />
      {createType !== 'Clone Linode' && (
        <Controller
          control={control}
          name="tags"
          render={({ field, fieldState }) => (
            <TagsInput
              disabled={!permissions.create_linode}
              onChange={(item) => field.onChange(item.map((i) => i.value))}
              tagError={fieldState.error?.message}
              value={
                field.value?.map((tag) => ({ label: tag, value: tag })) ?? []
              }
            />
          )}
        />
      )}
      {isPlacementGroupsEnabled && <PlacementGroupPanel />}
    </Paper>
  );
};
