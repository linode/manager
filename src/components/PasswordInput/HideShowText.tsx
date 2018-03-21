import * as React from 'react';

import { TextFieldProps } from 'material-ui/TextField';

import RemoveRedEye from 'material-ui-icons/RemoveRedEye';
import TextField from '../TextField';

interface State {
  hidden: Boolean;
}

type FinalProps = TextFieldProps;

class HideShowText extends React.Component<FinalProps, State> {
  state = {
    hidden: false,
  };

  toggleHidden = () => {
    this.setState({ hidden: !this.state.hidden });
  }

  render() {
    const { hidden } = this.state;

    return (
      <TextField
        onChange={this.props.onChange}
        type={hidden ? 'password' : 'text'}
        InputProps={{
          startAdornment: <RemoveRedEye onClick={this.toggleHidden}/>,
        }}
      />
    );
  }
}

export default HideShowText;
