import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import * as copy from 'copy-to-clipboard';

import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import CopyTooltip from 'src/components/CopyTooltip';

type ClassNames = 'root'
| 'input'
| 'copyIcon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  input: {
    backgroundColor: theme.bg.offWhite,
  },
  copyIcon: {
    marginRight: theme.spacing.unit,
  },
});

interface Props {
  className: string;
}

type CombinedProps = Props & TextFieldProps & WithStyles<ClassNames>;

class CopyableTextField extends React.Component<CombinedProps> {
  clickIcon = (value: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(value);
  }

  render() {
    const { value, restProps, classes, className } = this.props;

    return (
      <TextField
        value={value}
        {...restProps}
        className={`${className} ${'copy'}`}
        InputProps={{
          endAdornment: (
            <CopyTooltip
              text={`${value}`}
              className={classes.copyIcon}
            />
          ),
        }}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(CopyableTextField);
