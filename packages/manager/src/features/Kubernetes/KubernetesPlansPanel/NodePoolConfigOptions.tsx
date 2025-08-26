import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { NodePoolFirewallSelect } from '../NodePoolFirewallSelect';
import { NodePoolUpdateStrategySelect } from '../NodePoolUpdateStrategySelect';

import type { CreateNodePoolData } from '@linode/api-v4';

export const NodePoolConfigOptions = () => {
  const { control } = useFormContext<CreateNodePoolData>();

  return (
    <>
      <Controller
        control={control}
        name="update_strategy"
        render={({ field }) => (
          <NodePoolUpdateStrategySelect
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
      <NodePoolFirewallSelect />
    </>
  );
};
