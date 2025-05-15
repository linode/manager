import { Button, Stack, TextField } from '@linode/ui';
import { kubernetesLabelSchema } from '@linode/validation';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { Label } from '@linode/api-v4';

interface Props {
  handleCloseInputForm: () => void;
}

export const LabelInput = (props: Props) => {
  const { handleCloseInputForm } = props;

  const { clearErrors, control, setError, setValue, watch } = useFormContext();

  const [combinedLabel, setCombinedLabel] = useState('');

  const _labels: Label = watch('labels');

  const handleAddLabel = () => {
    // Separate the combined label.
    const [labelKey, labelValue] = combinedLabel
      .split(':')
      .map((str) => str.trim());

    const newLabels = { ..._labels, [labelKey]: labelValue };

    try {
      clearErrors();
      kubernetesLabelSchema.validateSync(newLabels);

      // Add the new key-value pair to the existing labels object.
      setValue('labels', newLabels, { shouldDirty: true });

      handleCloseInputForm();
    } catch (e) {
      setError(
        'labels',
        {
          message: e.message,
          type: 'validate',
        },
        { shouldFocus: true }
      );
    }
  };

  const handleClose = () => {
    clearErrors();
    handleCloseInputForm();
  };

  return (
    <>
      <Controller
        control={control}
        name="labels"
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              error={!!fieldState.error}
              errorText={fieldState.error?.message}
              label="Label"
              onChange={(e) => setCombinedLabel(e.target.value)}
              placeholder="myapp.io/app: production"
              value={combinedLabel}
            />
          );
        }}
      />
      <Stack flexDirection="row" marginTop={2}>
        <Button buttonType="primary" onClick={handleAddLabel}>
          Add
        </Button>
        <Button
          buttonType="secondary"
          data-testid="cancel-label"
          onClick={handleClose}
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
};
