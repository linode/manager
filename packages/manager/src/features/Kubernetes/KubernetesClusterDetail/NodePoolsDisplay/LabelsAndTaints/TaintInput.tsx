import { Autocomplete, Button, Stack, TextField } from '@linode/ui';
import { kubernetesTaintSchema } from '@linode/validation';
import React, { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import type { KubernetesTaintEffect } from '@linode/api-v4';

interface Props {
  handleCloseInputForm: () => void;
}

const effectOptions: { label: string; value: KubernetesTaintEffect }[] = [
  { label: 'NoExecute', value: 'NoExecute' },
  { label: 'NoSchedule', value: 'NoSchedule' },
  { label: 'PreferNoSchedule', value: 'PreferNoSchedule' },
];

export const TaintInput = (props: Props) => {
  const { handleCloseInputForm } = props;

  const { clearErrors, control, setError } = useFormContext();

  const { append } = useFieldArray({
    control,
    name: 'taints',
  });

  const [combinedTaint, setCombinedTaint] = useState('');
  const [selectedEffect, setSelectedEffect] = useState<KubernetesTaintEffect>(
    'NoExecute'
  );

  const handleAddTaint = () => {
    // Separate the combined taint.
    const [taintKey, taintValue] = combinedTaint
      .split(':')
      .map((str) => str.trim());

    const newTaint = {
      effect: selectedEffect,
      key: taintKey,
      value: taintValue,
    };

    try {
      clearErrors();
      kubernetesTaintSchema.validateSync(newTaint);
      append(newTaint);
      handleCloseInputForm();
    } catch (e) {
      setError(
        'taints.combinedValue',
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
            <TextField
              inputRef={field.ref}
              {...field}
              error={!!fieldState.error}
              errorText={fieldState.error?.message}
              label="Taint"
              onChange={(e) => setCombinedTaint(e.target.value)}
              placeholder="myapp.io/app: production"
              value={combinedTaint}
            />
          );
        }}
        control={control}
        name="taints.combinedValue"
      />
      <Controller
        render={() => (
          <Autocomplete
            value={
              effectOptions.find((option) => option.value === selectedEffect) ??
              undefined
            }
            disableClearable
            label="Effect"
            onChange={(e, option) => setSelectedEffect(option.value)}
            options={effectOptions}
          />
        )}
        control={control}
        name="taints.effect"
      />
      <Stack flexDirection="row" marginTop={2}>
        <Button buttonType="primary" onClick={handleAddTaint}>
          Add
        </Button>
        <Button
          buttonType="secondary"
          data-testid="cancel-taint"
          onClick={handleClose}
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
};
