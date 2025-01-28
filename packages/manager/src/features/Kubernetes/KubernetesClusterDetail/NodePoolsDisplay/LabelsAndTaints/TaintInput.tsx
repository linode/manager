import { Autocomplete, TextField } from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import type { KubernetesTaintEffect } from '@linode/api-v4';

interface Props {
  handleCloseInputForm: () => void;
}

export const TaintInput = (props: Props) => {
  const { handleCloseInputForm } = props;

  const { control } = useFormContext();

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
    // Trigger validation on textfield.

    // Separate the combined taint.
    const [taintKey, taintValue] = combinedTaint
      .split(':')
      .map((str) => str.trim());

    append({ effect: selectedEffect, key: taintKey, value: taintValue });

    handleCloseInputForm();
  };

  return (
    <>
      <Controller
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              inputRef={field.ref}
              label="Taint"
              onChange={(e) => setCombinedTaint(e.target.value)}
              placeholder="myapp.io/app: production"
              required
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
          onClick: handleCloseInputForm,
        }}
        style={{ flexDirection: 'row-reverse' }}
      />
    </>
  );
};
