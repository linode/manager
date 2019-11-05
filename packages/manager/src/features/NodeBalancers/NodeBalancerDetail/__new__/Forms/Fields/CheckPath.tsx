import * as React from 'react';
import TextField, { Props } from 'src/components/TextField';

type CombinedProps = Props;

const CheckPathField: React.FC<CombinedProps> = props => {
  return <TextField {...props} label="Check HTTP Path" required small />;
};

export default React.memo(CheckPathField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
