import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import { isEmpty, isNil } from 'ramda';

import  {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';

import Grid from 'material-ui/Grid';
import StrengthIndicator from '../PasswordInput/StrengthIndicator';

import TextField from '../TextField';

interface Props {}

interface State {
  strength: null | 0 | 1 | 2 | 3 | 4;
}

type ClassNames = 'container' | 'strengthIndicator';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.unit,
    paddingBottom: theme.spacing.unit / 2,
  },
  strengthIndicator: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});

type FinalProps = Props & WithStyles<ClassNames>;

class PasswordInput extends React.Component<FinalProps, State> {
  state = { strength: null };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    this.setState({
      strength: isEmpty(value) ? null :  zxcvbn(value).score,
    });
  }

  render() {
    const { strength } = this.state;
    const { classes } = this.props;

    return (
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <TextField onChange={this.handleChange} fullWidth />
        </Grid>
      {
        !isNil(strength)
          &&
          <Grid item xs={12} className={`${classes.strengthIndicator} py0`}>
            <StrengthIndicator strength={strength} />
          </Grid>
      }
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(PasswordInput);

