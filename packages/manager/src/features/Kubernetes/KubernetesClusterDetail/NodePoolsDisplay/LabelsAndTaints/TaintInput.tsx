import { Autocomplete, TextField } from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import type { KubernetesTaintEffect, Taint } from '@linode/api-v4';

interface Props {
  handleCloseInputForm: () => void;
}

export const TaintInput = (props: Props) => {
  const { handleCloseInputForm } = props;

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

    setValue(
      'taints',
      [..._taints, { effect: taintEffect, key: taintKey, value: taintValue }],
      { shouldDirty: true }
    );

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
              label="Taint"
              onChange={(e) => handleChangeTaint(e.target.value)}
              placeholder="myapp.io/app: production"
              value={combinedTaint}
            />
          );
        }}
        control={control}
        name="taints"
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
