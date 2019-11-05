import * as React from 'react';
import TextField, { Props } from 'src/components/TextField';

type CombinedProps = Props;

const CheckBodyField: React.FC<CombinedProps> = props => {
  return <TextField {...props} label="Expected HTTP Body" required small />;
};

export default React.memo(CheckBodyField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
