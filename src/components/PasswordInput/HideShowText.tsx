import * as React from 'react';

import { TextFieldProps } from 'material-ui/TextField';

import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import TextField from '../TextField';

interface State {
  hidden: Boolean;
}

type FinalProps = TextFieldProps;

class HideShowText extends React.Component<FinalProps, State> {
  state = {
    hidden: true,
  };

  toggleHidden = () => {
    this.setState({ hidden: !this.state.hidden });
  }

  render() {
    const { hidden } = this.state;

    return (
      <TextField
        data-qa-hide={hidden}
        label={this.props.label}
        placeholder={this.props.placeholder}
        onChange={this.props.onChange}
        type={hidden ? 'password' : 'text'}
        InputProps={{
          startAdornment: hidden
            ? <Visibility onClick={this.toggleHidden}/>
            : <VisibilityOff onClick={this.toggleHidden}/>,
        }}
      />
    );
  }
}

export default HideShowText;
