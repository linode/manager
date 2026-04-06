import { Autocomplete } from '@linode/ui';
import React from 'react';

import { UPDATE_STRATEGY_OPTIONS } from './constants';

interface Props {
  onChange: (value: string | undefined) => void;
  value: string | undefined;
}

export const NodePoolUpdateStrategySelect = (props: Props) => {
  const { onChange, value } = props;
  return (
    <Autocomplete
      disableClearable
      label="Update Strategy"
      noMarginTop
      onChange={(e, updateStrategy) => onChange(updateStrategy?.value)}
      options={UPDATE_STRATEGY_OPTIONS}
      placeholder="Select an Update Strategy"
      value={UPDATE_STRATEGY_OPTIONS.find((option) => option.value === value)}
    />
  );
};
