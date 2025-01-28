import { IconButton, Stack, TextField } from '@linode/ui';
import { kubernetesLabelSchema } from '@linode/validation';
import Close from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

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
      setValue(
        'labels',
        { ..._labels, [labelKey]: labelValue },
        { shouldDirty: true }
      );

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
        render={({ field, fieldState }) => {
          return (
            <Stack direction="row">
              <TextField
                {...field}
                containerProps={{ sx: { width: 399 } }}
                error={!!fieldState.error}
                errorText={fieldState.error?.message}
                label="Label"
                onChange={(e) => setCombinedLabel(e.target.value)}
                placeholder="myapp.io/app: production"
                value={combinedLabel}
              />
              <IconButton
                aria-label="Close Add Label form"
                disableRipple
                onClick={handleCloseInputForm}
                size="medium"
                sx={{ alignSelf: 'flex-end', paddingY: '7px' }}
              >
                <Close />
              </IconButton>
            </Stack>
          );
        }}
        control={control}
        name="labels"
      />

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'add-label',
          label: 'Add',
          onClick: handleAddLabel,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel-label',
          label: 'Cancel',
          onClick: handleClose,
        }}
        style={{ flexDirection: 'row-reverse' }}
      />
    </>
  );
};
