import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as React from 'react';
import { TextFieldProps } from 'src/components/core/TextField';
import TextField from '../TextField';

interface State {
  hidden: Boolean;
}

type Props = TextFieldProps & {
  required?: boolean;
  tooltipText?: string;
};

class HideShowText extends React.Component<Props, State> {
  state = {
    hidden: true
  };

  toggleHidden = () => {
    this.setState({ hidden: !this.state.hidden });
  };

  render() {
    const { hidden } = this.state;

    return (
      <TextField
        {...this.props}
        dataAttrs={{
          'data-qa-hide': hidden
        }}
        type={hidden ? 'password' : 'text'}
        InputProps={{
          startAdornment: hidden ? (
            <Visibility
              onClick={this.toggleHidden}
              style={{ marginLeft: 14 }}
            />
          ) : (
            <VisibilityOff
              onClick={this.toggleHidden}
              style={{ marginLeft: 14 }}
            />
          )
        }}
      />
    );
  }
}

export default HideShowText as React.ComponentType<Props>;
