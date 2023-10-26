import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField, TextFieldProps } from 'src/components/TextField';

interface LabelProps {
  error?: string;
  labelFieldProps: TextFieldProps;
}

export const LoadBalancerLabel = (props: LabelProps) => {
  const { error, labelFieldProps } = props;

  return (
    <Paper
      sx={{
        flexGrow: 1,
        width: '100%',
      }}
      data-qa-label-header
    >
      {error && <Notice text={error} variant="error" />}
      <TextField
        data-qa-label-input
        disabled={labelFieldProps.disabled}
        errorText={labelFieldProps.errorText}
        label="Load Balancer Label"
        noMarginTop
        onChange={() => labelFieldProps.onChange}
        placeholder="Enter a label"
        value={labelFieldProps.value}
      />
    </Paper>
  );
};
