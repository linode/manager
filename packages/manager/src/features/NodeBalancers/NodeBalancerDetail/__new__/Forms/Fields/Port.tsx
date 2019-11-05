import * as React from 'react';
import TextField, { Props } from 'src/components/TextField';

type CombinedProps = Props;

const PortField: React.FC<CombinedProps> = props => {
  return (
    <TextField
      {...props}
      type="number"
      label="Port"
      required
      data-qa-port
      small
      min={0}
      max={65534}
      noMarginTop
      helperText="Listen on this port"
    />
  );
};

export default React.memo(PortField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
