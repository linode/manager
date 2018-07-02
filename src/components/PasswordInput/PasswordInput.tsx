import * as React from 'react';

import * as zxcvbn from 'zxcvbn';

import { isEmpty } from 'ramda';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';
import { Props as TextFieldProps } from 'src/components/TextField';
import StrengthIndicator from '../PasswordInput/StrengthIndicator';
import HideShowText from './HideShowText';

interface Props extends TextFieldProps {
  value?: string;
  required?: boolean;
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
    [theme.breakpoints.down('xs')]: {
      maxWidth: 240 + theme.spacing.unit * 2,
    },
  },
});

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordInput extends React.Component<CombinedProps, State> {
  state: State = {
    strength: maybeStrength(this.props.value),
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    const { value } = nextProps;
    this.setState({ strength: maybeStrength(value) });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.currentTarget.value;

    this.props.onChange && this.props.onChange(e);
    this.setState({ strength: maybeStrength(value) });
  }

  render() {
    const { strength } = this.state;
    const { classes, value, required, ...rest } = this.props;

    return (
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <HideShowText
            value={value}
            {...rest}
            onChange={this.onChange}
            fullWidth
            required={required}
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

const maybeStrength = (value?: string) =>
  !value || isEmpty(value)
    ? null
    : zxcvbn(value).score;

export default withStyles(styles, { withTheme: true })<Props>(PasswordInput);
