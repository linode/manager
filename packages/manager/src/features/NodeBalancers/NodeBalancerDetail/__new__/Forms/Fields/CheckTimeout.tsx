import * as React from 'react';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField, { Props } from 'src/components/TextField';

type CombinedProps = Props;

const CheckTimeoutField: React.FC<CombinedProps> = props => {
  return (
    <TextField
      {...props}
      type="number"
      label="Timeout"
      InputProps={{
        'aria-label': 'Active Health Check Timeout',
        endAdornment: <InputAdornment position="end">seconds</InputAdornment>
      }}
      data-qa-active-check-timeout
      helperText="Seconds to wait before considering the probe a failure. 1-30. Must be less than check_interval."
    />
  );
};

export default React.memo(CheckTimeoutField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
