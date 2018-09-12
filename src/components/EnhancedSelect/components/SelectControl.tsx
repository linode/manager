import * as React from 'react';
import { ControlProps } from 'react-select/lib/components/Control';

import Select from 'react-select';
import TextField from 'src/components/TextField';

interface SelectProps extends Select<any> {
  inputRef: any;
  props: any;
}

const inputComponent = ({ inputRef, ...props }: SelectProps) => {
  return <div ref={inputRef} {...props} />;
}

interface Props extends ControlProps<any> { }

const SelectControl: React.StatelessComponent<Props> = (props) => {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

export default SelectControl;
