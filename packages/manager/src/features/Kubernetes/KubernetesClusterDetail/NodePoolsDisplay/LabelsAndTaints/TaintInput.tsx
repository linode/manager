import { Autocomplete, Button, TextField } from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { KubernetesTaintEffect, Taint } from '@linode/api-v4';

interface Props {
  handleSave: () => void;
}

export const TaintInput = (props: Props) => {
  const { handleSave } = props;

  const { control, setValue, watch } = useFormContext();

  const _taints: Taint[] = watch('taints');

  const [combinedTaint, setCombinedTaint] = useState('');
  const [taintEffect, setTaintEffect] = useState('NoExecute');

  const handleChangeTaint = (combinedValue: string) => {
    setCombinedTaint(combinedValue);
  };

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

    // Validation?

    setValue('taints', [
      ..._taints,
      { effect: taintEffect, key: taintKey, value: taintValue },
    ]);
    handleSave();
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
              label="Label"
              onChange={(e) => handleChangeTaint(e.target.value)}
              placeholder="myapp.io/app: production"
              value={combinedTaint}
            />
          );
        }}
        control={control}
        name="labels"
      />
      <Controller
        render={({}) => (
          <Autocomplete
            value={
              effectOptions.find((option) => option.value === taintEffect) ??
              undefined
            }
            data-qa-ticket-entity-type
            disableClearable
            label="Effect"
            onChange={(e, option) => setTaintEffect(option.label)}
            options={effectOptions}
          />
        )}
        control={control}
        name="entityType"
      />

      <Button
        buttonType="primary"
        onClick={handleAddTaint}
        sx={{ marginTop: 2 }}
      >
        Add
      </Button>
    </>
  );
};
