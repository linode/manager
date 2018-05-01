import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import * as copy from 'copy-to-clipboard';

import ContentCopyIcon from 'material-ui-icons/ContentCopy';

import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type ClassNames =
  'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {
  copied: boolean;
}

type CombinedProps = Props & TextFieldProps & WithStyles<ClassNames>;

class CopyableTextField extends React.Component<CombinedProps, State> {
  state = {
    copied: false,
  };

  clickIcon = (value: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(value);
  }

  render() {
    const { value } = this.props;
    return (
      <TextField
        {...this.props}
        InputProps={{
          endAdornment: (
            <ContentCopyIcon
              onClick={() => this.clickIcon(`${value}`)}
            />
          ),
        }}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(CopyableTextField);
