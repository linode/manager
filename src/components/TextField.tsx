import * as React from 'react';
import { equals } from 'ramda';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

export interface Props extends TextFieldProps {
  errorText?: string;
  errorGroup?: string;
  affirmative?: Boolean;
  [index: string]: any;
}

class LinodeTextField extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.value !== this.props.value
      || nextProps.errorText !== this.props.errorText
      || nextProps.affirmative !== this.props.affirmative
      || nextProps.select !== this.props.select
      || nextProps.type !== this.props.type
      || nextProps.disabled !== this.props.disabled
      || Boolean(this.props.select && nextProps.children !== this.props.children)
      || !equals(nextProps.InputProps, this.props.InputProps);
  }

  render() {
    const {
      errorText,
      errorGroup,
      affirmative,
      fullWidth,
      children,
      ...textFieldProps
    } = this.props;

    const finalProps: TextFieldProps = { ...textFieldProps };

    if (errorText) {
      finalProps.error = true;
      finalProps.helperText = errorText;
      const errorScrollClassName = errorGroup
        ? `error-for-scroll-${errorGroup}`
        : `error-for-scroll`;
      finalProps.InputProps = {
        className: errorScrollClassName,
      };
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
