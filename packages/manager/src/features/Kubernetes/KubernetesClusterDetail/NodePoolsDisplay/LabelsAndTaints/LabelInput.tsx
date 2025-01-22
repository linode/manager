import { Button, IconButton, Stack, TextField } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  handleSave: () => void;
}

export const LabelInput = (props: Props) => {
  const { handleSave } = props;

  const { control, setValue, watch } = useFormContext();

  const _labels = watch('labels');

  const [combinedLabel, setCombinedLabel] = useState('');

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

    handleSave();
  };

  return (
    <>
      <Controller
        render={({ field, fieldState }) => {
          return (
            <Stack direction="row">
              <TextField
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                label="Label"
                onChange={(e) => handleChangeLabel(e.target.value)}
                placeholder="myapp.io/app: production"
                sx={{ width: 385 }}
                value={combinedLabel}
              />
              <IconButton
                aria-label={`Close Add Label form`}
                disableRipple
                onClick={handleSave}
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

      <Button
        buttonType="primary"
        onClick={handleAddLabel}
        sx={{ marginTop: 2 }}
      >
        Add
      </Button>
    </>
  );
};
