import { IconButton, Stack, TextField } from '@linode/ui';
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

  const { control, setValue, watch } = useFormContext();

  const [combinedLabel, setCombinedLabel] = useState('');

  const _labels: Label = watch('labels');

  const handleChangeLabel = (combinedValue: string) => {
    setCombinedLabel(combinedValue);
  };

  const handleAddLabel = () => {
    // Separate the combined label.
    const [labelKey, labelValue] = combinedLabel
      .split(':')
      .map((str) => str.trim());

    // Validation?

    // Add the new key-value pair to the existing labels object.
    setValue(
      'labels',
      { ..._labels, [labelKey]: labelValue },
      { shouldDirty: true }
    );

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
                helperText={fieldState.error?.message}
                label="Label"
                onChange={(e) => handleChangeLabel(e.target.value)}
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
          onClick: handleCloseInputForm,
        }}
        style={{ flexDirection: 'row-reverse' }}
      />
    </>
  );
};
