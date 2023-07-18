import * as React from 'react';

import { TextField } from 'src/components/TextField';
import { TooltipProps } from 'src/components/Tooltip';

interface Props {
  disabled?: boolean;
  error?: string;
  name: string;
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  textFieldStyles?: string;
  tooltipClasses?: string;
  tooltipPosition?: TooltipProps['placement'];
  tooltipText?: JSX.Element | string;
  value: string;
}

type CombinedProps = Props;

const LabelField: React.FC<CombinedProps> = ({
  error,
  name,
  onBlur,
  onChange,
  textFieldStyles,
  value,
  ...rest
}) => {
  return (
    <TextField
      className={textFieldStyles}
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

export default LabelField;
