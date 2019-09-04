import * as React from 'react';
import { ControlProps } from 'react-select/lib/components/Control';

import TextField from 'src/components/TextField';

interface SelectProps {
  inputRef: any;
  props: any;
}

const inputComponent: React.StatelessComponent<SelectProps> = ({
  inputRef,
  ...props
}) => {
  return <div ref={inputRef} {...props} />;
};

interface Props extends ControlProps<any> {}

const SelectControl: React.StatelessComponent<Props> = props => {
  const qaLabel = props.selectProps.value
    ? props.selectProps.value.label
    : props.selectProps.placeholder;
  return (
    <TextField
      data-qa-enhanced-select={qaLabel}
      data-testid={qaLabel}
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps
        }
      }}
      {...props.selectProps.textFieldProps}
    />
  );
};

export default SelectControl;
