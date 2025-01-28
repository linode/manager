import { Autocomplete, TextField } from '@linode/ui';
import { taintSchema } from '@linode/validation';
import React, { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import type { KubernetesTaintEffect } from '@linode/api-v4';

interface Props {
  handleCloseInputForm: () => void;
}

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

  const effectOptions: { label: string; value: KubernetesTaintEffect }[] = [
    { label: 'NoExecute', value: 'NoExecute' },
    { label: 'NoSchedule', value: 'NoSchedule' },
    { label: 'PreferNoSchedule', value: 'PreferNoSchedule' },
  ];

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
      taintSchema.validateSync(newTaint);
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
        render={({}) => (
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
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'add-taint',
          label: 'Add',
          onClick: handleAddTaint,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel-taint',
          label: 'Cancel',
          onClick: handleClose,
        }}
        style={{ flexDirection: 'row-reverse' }}
      />
    </>
  );
};
