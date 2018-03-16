import * as React from 'react';

import TextField, { TextFieldProps } from 'material-ui/TextField';

interface Props {
  errorText?: string;
  affirmative?: Boolean;
}

type CombinedProps = Props & TextFieldProps;

const LinodeTextField: React.StatelessComponent<CombinedProps> = (props) => {
  const finalProps = { ...props };

  if (props.errorText) {
    finalProps.error = true;
    finalProps.helperText = props.errorText;
  }

  if (props.affirmative) {
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
    >
      {props.children}
    </TextField>
  );
};

export default LinodeTextField;
