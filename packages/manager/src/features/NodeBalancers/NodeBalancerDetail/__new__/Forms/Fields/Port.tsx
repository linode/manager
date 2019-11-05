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
      /** https://www.google.com/search?q=how+many+ports+are+there+computer&oq=how+many+ports+are+there+computer&aqs=chrome..69i57j0l5.4099j0j7&sourceid=chrome&ie=UTF-8 */
      min={0}
      max={70000}
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
