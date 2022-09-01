import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as React from 'react';
import { TextFieldProps } from 'src/components/core/TextField';
import TextField from '../TextField';

interface State {
  hidden: boolean;
}

type Props = TextFieldProps & {
  required?: boolean;
  tooltipText?: string;
  label: string;
  value: string | undefined;
};

class HideShowText extends React.Component<Props, State> {
  state = {
    hidden: true,
  };

  toggleHidden = () => {
    this.setState({ hidden: !this.state.hidden });
  };

  render() {
    const { hidden } = this.state;
    const { label, value } = this.props;

    return (
      <TextField
        {...this.props}
        dataAttrs={{
          'data-qa-hide': hidden,
        }}
        value={value}
        label={label}
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
          ),
        }}
        autoComplete="off"
      />
    );
  }
}

export default HideShowText as React.ComponentType<Props>;
