import * as React from 'react';
import TextField from 'src/components/TextField';

interface Props {
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  name: string;
  value: string;
  disabled?: boolean;
  error?: string;
  textFieldStyles?: string;
  tooltipClasses?: string;
  tooltipPosition?:
    | 'bottom'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
  tooltipText?: string | JSX.Element;
}

type CombinedProps = Props;

const LabelField: React.FC<CombinedProps> = ({
  name,
  value,
  error,
  onBlur,
  onChange,
  textFieldStyles,
  ...rest
}) => {
  return (
    <TextField
      className={textFieldStyles}
      label="Label"
      name={name}
      value={value}
      errorText={error}
      onBlur={onBlur}
      onChange={onChange}
      required
      data-qa-volume-label
      {...rest}
    />
  );
};

export default LabelField;
