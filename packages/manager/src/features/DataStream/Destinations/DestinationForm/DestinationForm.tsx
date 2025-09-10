import { destinationType } from '@linode/api-v4';
import { Autocomplete, Box, Button, Paper, TextField } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';

import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { DestinationLinodeObjectStorageDetailsForm } from 'src/features/DataStream/Shared/DestinationLinodeObjectStorageDetailsForm';
import { LabelValue } from 'src/features/DataStream/Shared/LabelValue';
import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';

import type {
  DestinationFormType,
  FormMode,
} from 'src/features/DataStream/Shared/types';

type DestinationFormProps = {
  destinationId?: string;
  mode: FormMode;
  onSubmit: SubmitHandler<DestinationFormType>;
};

export const DestinationForm = (props: DestinationFormProps) => {
  const { mode, onSubmit, destinationId } = props;
  const theme = useTheme();

  const { control, handleSubmit } = useFormContext<DestinationFormType>();

  const selectedDestinationType = useWatch({
    control,
    name: 'type',
  });

  return (
    <>
      <Paper>
        <form id="destinationForm" onSubmit={handleSubmit(onSubmit)}>
          {destinationId && (
            <LabelValue compact={true} label="ID" value={destinationId} />
          )}
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Autocomplete
                disableClearable
                disabled
                label="Destination Type"
                onBlur={field.onBlur}
                onChange={(_, { value }) => {
                  field.onChange(value);
                }}
                options={destinationTypeOptions}
                value={getDestinationTypeOption(field.value)}
              />
            )}
            rules={{ required: true }}
          />
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                aria-required
                errorText={fieldState.error?.message}
                label="Destination Name"
                onBlur={field.onBlur}
                onChange={(value) => {
                  field.onChange(value);
                }}
                placeholder="Destination Name..."
                value={field.value}
              />
            )}
            rules={{ required: true }}
          />
          {selectedDestinationType === destinationType.LinodeObjectStorage && (
            <DestinationLinodeObjectStorageDetailsForm />
          )}
        </form>
      </Paper>
      <Box
        alignItems="center"
        display="flex"
        flexWrap="wrap"
        justifyContent="flex-end"
      >
        <Button
          buttonType="primary"
          form="destinationForm"
          sx={{ mt: theme.spacingFunction(16) }}
          type="submit"
        >
          {mode === 'edit' ? 'Edit' : 'Create'} Destination
        </Button>
      </Box>
    </>
  );
};
