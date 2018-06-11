import * as React from 'react';
import TextField, { TextFieldProps } from 'material-ui/TextField';

export interface Props extends TextFieldProps {
  errorText?: string;
  affirmative?: Boolean;
  [index: string]: any;
}

class LinodeTextField extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.value !== this.props.value
      || nextProps.errorText !== this.props.errorText
      || nextProps.affirmative !== this.props.affirmative
      || nextProps.select !== this.props.select
      || nextProps.type !== this.props.type;
  }

  render() {
    const {
      errorText,
      affirmative,
      fullWidth,
      children,
      ...textFieldProps,
    } = this.props;

    const finalProps: TextFieldProps = { ...textFieldProps };

    if (errorText) {
      finalProps.error = true;
      finalProps.helperText = errorText;
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
        SelectProps={{
          MenuProps: {
            getContentAnchorEl: undefined,
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
            MenuListProps: { className: 'selectMenuList' },
            PaperProps: { className: 'selectMenuDropdown' },
          },
        }}
      >
        {this.props.children}
      </TextField>
    );
  }
}

export default LinodeTextField;
