import { Autocomplete } from '@linode/ui';
import React from 'react';

import { UPDATE_STRATEGY_OPTIONS } from './constants';

interface Props {
  label?: string;
  noMarginTop?: boolean;
  onChange: (value: string | undefined) => void;
  value: string | undefined;
}

export const NodePoolUpdateStrategySelect = (props: Props) => {
  const { onChange, value, noMarginTop, label } = props;
  return (
    <Autocomplete
      disableClearable
      label={label ?? 'Node Pool Update Strategy'}
      noMarginTop={noMarginTop}
      onChange={(e, updateStrategy) => onChange(updateStrategy?.value)}
      options={UPDATE_STRATEGY_OPTIONS}
      placeholder="Select an Update Strategy"
      value={UPDATE_STRATEGY_OPTIONS.find((option) => option.value === value)}
    />
  );
};
