import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import TextField, { TextFieldProps } from 'material-ui/TextField';

type CSSClasses = 'root';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  errorText?: string;
}

type CombinedProps = Props & WithStyles<CSSClasses> & TextFieldProps;

const LinodeTextField: React.StatelessComponent<CombinedProps> = (props) => {
  const finalProps = { ...props };

  if (props.error) {

  }

  return (
    <TextField
      InputLabelProps={{
        ...finalProps.InputLabelProps,
        shrink: true,
      }}
      InputProps={{
        ...finalProps.InputProps,
        disableUnderline: true,
      }}
      {...finalProps}
    >
      {props.children}
    </TextField>
  );
};

export default styled(LinodeTextField);
