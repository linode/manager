import * as React from 'react';
import TextField, { Props } from 'src/components/TextField';

type CombinedProps = Props;

const CheckAttemptsField: React.FC<CombinedProps> = props => {
  return (
    <TextField
      {...props}
      type="number"
      label="Attempts"
      InputProps={{
        'aria-label': 'Active Health Check Attempts'
      }}
      data-qa-active-check-attempts
      small
      helperText="Number of failed probes before taking a node out of rotation. 1-30"
    />
  );
};

export default React.memo(CheckAttemptsField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
