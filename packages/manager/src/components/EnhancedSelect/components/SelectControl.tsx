import * as React from 'react';
import { ControlProps } from 'react-select';

import TextField from 'src/components/TextField';

interface Props extends ControlProps<any, any> {}

const SelectControl: React.FC<Props> = (props) => {
  return (
    <TextField
      data-qa-enhanced-select={
        props.selectProps.value
          ? props.selectProps.value.label
          : props.selectProps.placeholder
      }
      fullWidth
      InputProps={{
        inputComponent: 'div',
        inputProps: {
          children: props.children,
          className: props.selectProps.classes.input,
          ref: props.innerRef,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
};

export default SelectControl;
