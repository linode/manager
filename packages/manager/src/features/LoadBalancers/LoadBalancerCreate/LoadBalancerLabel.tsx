import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';

import { useLoadBalancerState } from '../useLoadBalancerState';

export const LoadBalancerLabel = () => {
  const {
    errors,
    handleLabelChange,
    loadBalancerLabelValue,
  } = useLoadBalancerState();

  return (
    <Paper
      sx={{
        flexGrow: 1,
        width: '100%',
      }}
      data-qa-label-header
    >
      <TextField
        data-qa-label-input
        disabled={false}
        errorText={errors.label}
        label="Load Balancer Label"
        noMarginTop
        onChange={handleLabelChange}
        placeholder="Enter a label"
        value={loadBalancerLabelValue}
      />
    </Paper>
  );
};
