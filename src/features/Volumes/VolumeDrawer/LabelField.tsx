import * as React from 'react';
import TextField from 'src/components/TextField';

interface Props {
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  error?: string;
  value: string;
  name: string;
  disabled?: boolean;
}

type CombinedProps = Props;

const LabelField: React.StatelessComponent<CombinedProps> = ({
  error,
  onBlur,
  onChange,
  value,
  name,
  ...rest
}) => {
  return (
    <TextField
      data-qa-volume-label
      errorText={error}
      label="Label"
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      required
      value={value}
      {...rest}
    />
  );
};

const styled = styles;

export default LabelField;
