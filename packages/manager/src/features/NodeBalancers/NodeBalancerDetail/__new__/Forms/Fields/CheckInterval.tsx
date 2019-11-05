import * as React from 'react';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField, { Props } from 'src/components/TextField';

type CombinedProps = Props;

const CheckIntervalField: React.FC<CombinedProps> = props => {
  return (
    <TextField
      {...props}
      type="number"
      label="Interval"
      InputProps={{
        'aria-label': 'Active Health Check Interval',
        endAdornment: <InputAdornment position="end">seconds</InputAdornment>
      }}
      data-qa-active-check-interval
      small
      helperText="Seconds between health check probes"
    />
  );
};

export default React.memo(CheckIntervalField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
