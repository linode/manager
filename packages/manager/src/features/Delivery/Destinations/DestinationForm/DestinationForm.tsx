import { destinationType } from '@linode/api-v4';
import { Autocomplete, Paper, TextField } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';

import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';
import { DestinationAkamaiObjectStorageDetailsForm } from 'src/features/Delivery/Shared/DestinationAkamaiObjectStorageDetailsForm';
import { FormSubmitBar } from 'src/features/Delivery/Shared/FormSubmitBar/FormSubmitBar';
import { destinationTypeOptions } from 'src/features/Delivery/Shared/types';
import { useVerifyDestination } from 'src/features/Delivery/Shared/useVerifyDestination';

import type {
  DestinationFormType,
  FormMode,
} from 'src/features/Delivery/Shared/types';

interface DestinationFormProps {
  isSubmitting: boolean;
  mode: FormMode;
  onSubmit: SubmitHandler<DestinationFormType>;
}

export const DestinationForm = (props: DestinationFormProps) => {
  const { mode, isSubmitting, onSubmit } = props;

  const {
    verifyDestination,
    isPending: isVerifyingDestination,
    destinationVerified,
    setDestinationVerified,
  } = useVerifyDestination();

  const { control, handleSubmit } = useFormContext<DestinationFormType>();
  const destination = useWatch({
    control,
  }) as DestinationFormType;

  useEffect(() => {
    setDestinationVerified(false);
  }, [destination, setDestinationVerified]);

  return (
    <form id="destinationForm">
      <Grid container spacing={2}>
        <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
          <Paper>
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
                  placeholder="Destination Name"
                  value={field.value}
                />
              )}
            />
            {destination.type === destinationType.AkamaiObjectStorage && (
              <DestinationAkamaiObjectStorageDetailsForm />
            )}
          </Paper>
        </Grid>
        <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
          <FormSubmitBar
            blockSubmit={true}
            connectionTested={destinationVerified}
            formType={'destination'}
            isSubmitting={isSubmitting}
            isTesting={isVerifyingDestination}
            mode={mode}
            onSubmit={handleSubmit(onSubmit)}
            onTestConnection={handleSubmit(() =>
              verifyDestination(destination)
            )}
          />
        </Grid>
      </Grid>
    </form>
  );
};
