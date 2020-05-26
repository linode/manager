import * as React from 'react';
import { ControlProps } from 'react-select';

import TextField from 'src/components/TextField';

interface SelectProps {
  inputRef: any;
  props: any;
}

const inputComponent: React.FC<SelectProps> = ({ inputRef, ...props }) => {
  return <div ref={inputRef} {...props} />;
};

interface Props extends ControlProps<any> {}

const SelectControl: React.FC<Props> = props => {
  return (
    <TextField
      data-qa-enhanced-select={
        props.selectProps.value
          ? props.selectProps.value.label
          : props.selectProps.placeholder
      }
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
