import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import { isEmpty, isNil } from 'ramda';

import Grid from 'material-ui/Grid';
import StrengthIndicator from '../PasswordInput/StrengthIndicator';

import TextField from '../TextField';
interface Props {}

interface State {
  strength: null | 0 | 1 | 2 | 3 | 4;
}

class PasswordInput extends React.Component<Props, State> {
  state = { strength: null };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    this.setState({
      strength: isEmpty(value) ? null :  zxcvbn(value).score,
    });
  }

  render() {
    const { strength } = this.state;

    return (
      <Grid container>
      <Grid item xs={12}><TextField onChange={this.handleChange} /></Grid>
      {
        !isNil(strength)
          && <Grid item xs={12}><StrengthIndicator strength={strength} /></Grid>
      }
      </Grid>
    );
  }
}

export default PasswordInput;
