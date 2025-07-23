import { Autocomplete } from '@linode/ui';
import React from 'react';

import { UPDATE_STRATEGY_OPTIONS } from './constants';

interface Props {
  onChange: (value: string | undefined) => void;
  value: string;
}

export const NodePoolUpdateStrategySelect = (props: Props) => {
  const { onChange, value } = props;
  return (
    <Autocomplete
      disableClearable
      label="Node Pool Update Strategy"
      onChange={(e, updateStrategy) => onChange(updateStrategy?.value)}
      options={UPDATE_STRATEGY_OPTIONS}
      placeholder="Select an Update Strategy"
      value={UPDATE_STRATEGY_OPTIONS.find((option) => option.value === value)}
    />
  );
};
