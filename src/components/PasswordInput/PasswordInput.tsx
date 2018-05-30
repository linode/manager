import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import { isEmpty } from 'ramda';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';

import Grid from 'src/components/Grid';
import StrengthIndicator from '../PasswordInput/StrengthIndicator';
import { Props as TextFieldProps } from 'src/components/TextField';
import HideShowText from './HideShowText';

interface Props extends TextFieldProps {
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

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordInput extends React.Component<CombinedProps, State> {
  state = { strength: null };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange && this.props.onChange(e);

    const value = e.currentTarget.value;
    this.setState({
      strength: isEmpty(value) ? null : zxcvbn(value).score,
    });
  }

  render() {
    const { strength } = this.state;
    const { classes, value, ...rest } = this.props;

    return (
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <HideShowText
            value={value}
            {...rest}
            onChange={this.onChange}
            fullWidth
          />
        </Grid>
        {
          <Grid item xs={12} className={`${classes.strengthIndicator} py0`}>
            <StrengthIndicator strength={(value !== undefined &&
              value.toString().length === 0) ? 0 : strength} />
          </Grid>
        }
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(PasswordInput);

