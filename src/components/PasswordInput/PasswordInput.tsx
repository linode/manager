import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import { isEmpty } from 'ramda';

import  {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import { TextFieldProps } from 'material-ui/TextField';

import Grid from 'src/components/Grid';
import StrengthIndicator from '../PasswordInput/StrengthIndicator';

import HideShowText from './HideShowText';

interface Props {
  label?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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

type FinalProps = Props & WithStyles<ClassNames> & TextFieldProps;

class PasswordInput extends React.Component<FinalProps, State> {
  state = { strength: null };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange && this.props.onChange(e);

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
          <HideShowText
            label={this.props.label}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.handleChange}
            fullWidth
          />
        </Grid>
      {
        <Grid item xs={12} className={`${classes.strengthIndicator} py0`}>
          <StrengthIndicator strength={strength} />
        </Grid>
      }
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(PasswordInput);

