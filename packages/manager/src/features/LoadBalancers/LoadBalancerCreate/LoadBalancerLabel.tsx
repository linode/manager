import { useFormikContext } from 'formik';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

export const LoadBalancerLabel = () => {
  const {
    errors,
    handleBlur,
    handleChange,
    touched,
    values,
  } = useFormikContext<CreateLoadbalancerPayload>();

  return (
    <Paper
      sx={{
        flexGrow: 1,
        width: '100%',
      }}
      data-qa-label-header
    >
      <TextField
        disabled={false}
        errorText={touched.label && errors.label ? errors.label : undefined} // Display errors if the field is touched and there's an error
        label="Load Balancer Label"
        name="label"
        noMarginTop
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Enter a label"
        value={values?.label}
      />
    </Paper>
  );
};
