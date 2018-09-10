import * as React from 'react';

import TextField from 'src/components/TextField';

interface SelectProps {
  inputRef: any;
  props: any;
}

const inputComponent = ({ inputRef, ...props }:SelectProps) => {
  return <div ref={inputRef} {...props} />;
}

const SelectControl: React.StatelessComponent = (props:any) => {
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