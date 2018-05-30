import * as React from 'react';

import TextField, { TextFieldProps } from 'material-ui/TextField';

export interface Props extends TextFieldProps {
  errorText?: string;
  affirmative?: Boolean;
  [index: string]: any;
}

const LinodeTextField: React.StatelessComponent<Props> = (props) => {
  const {
    errorText,
    affirmative,
    fullWidth,
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

  finalProps.fullWidth = fullWidth === false
    ? false
    : true;

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
      SelectProps={{ MenuProps: {
        getContentAnchorEl: undefined,
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
        MenuListProps: { className: 'selectMenuList' },
        PaperProps: { className: 'selectMenuDropdown' },
      }}}
    >
      {props.children}
    </TextField>
  );
};

export default LinodeTextField;
