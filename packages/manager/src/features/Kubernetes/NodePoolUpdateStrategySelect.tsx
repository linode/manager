import { Autocomplete } from '@linode/ui';
import React from 'react';

const updateStrategyOptions = [
  { label: 'On Recycle Updates', value: 'on_recycle' },
  { label: 'Rolling Updates', value: 'rolling_update' },
];

interface Props {
  onChange: (value: string | undefined) => void;
  value: string;
}

export const NodePoolUpdateStrategySelect = (props: Props) => {
  const { onChange, value } = props;
  return (
    <Autocomplete
      label="Node Pool Update Strategy"
      onChange={(e, updateStrategy) => onChange(updateStrategy?.value)}
      options={updateStrategyOptions}
      placeholder="Select an Update Strategy"
      value={
        updateStrategyOptions.find((option) => option.value === value) ?? null
      }
    />
  );
};
