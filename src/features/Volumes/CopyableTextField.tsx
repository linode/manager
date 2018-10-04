import * as copy from 'copy-to-clipboard';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import CopyTooltip from 'src/components/CopyTooltip';
import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type ClassNames = 'root'
| 'input'
| 'copyIcon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  input: {
    backgroundColor: theme.bg.offWhite,
  },
  copyIcon: {
    marginRight: theme.spacing.unit,
  },
});

interface Props extends TextFieldProps {
  className: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class CopyableTextField extends React.Component<CombinedProps> {
  clickIcon = (value: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(value);
  }

  render() {
    const { value, classes, className, ...restProps } = this.props;

    return (
      <TextField
        value={value}
        {...restProps}
        className={`${className} ${'copy'}`}
        data-qa-copy-tooltip
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
