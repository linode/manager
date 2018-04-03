import * as React from 'react';

import TextField, { TextFieldProps } from 'material-ui/TextField';

interface Props extends TextFieldProps{
  errorText?: string;
  affirmative?: Boolean;
}

const LinodeTextField: React.StatelessComponent<Props> = (props) => {
  const {
    errorText,
    affirmative,
    ...textFieldProps,
  } = props;

  const finalProps: TextFieldProps = { ...textFieldProps };

  if (errorText) {
    finalProps.error = true;
    finalProps.helperText = props.errorText;
  }

  if (affirmative) {
    finalProps.InputProps = {
      className: 'affirmative',
    };
  }

  return (
    <TextField
      {...finalProps}
      InputLabelProps={{
        ...finalProps.InputLabelProps,
        shrink: true,
      }}
      InputProps={{
        ...finalProps.InputProps,
        disableUnderline: true,
      }}
      fullWidth
    >
      {props.children}
    </TextField>
  );
};

export default LinodeTextField;
