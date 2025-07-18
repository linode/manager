import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { NodePoolUpdateStrategySelect } from '../NodePoolUpdateStrategySelect';

export const NodePoolConfigOptions = () => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name="updateStrategy"
      render={({ field }) => (
        <NodePoolUpdateStrategySelect
          onChange={field.onChange}
          value={field.value}
        />
      )}
    />
  );
};
