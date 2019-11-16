import { isEmpty } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { Props as TextFieldProps } from 'src/components/TextField';
import StrengthIndicator from '../PasswordInput/StrengthIndicator';
import HideShowText from './HideShowText';

type Props = TextFieldProps & {
  value?: string;
  required?: boolean;
  disabledReason?: string;
  hideStrengthLabel?: boolean;
  hideHelperText?: boolean;
  hideValidation?: boolean;
};

interface State {
  strength: null | 0 | 1 | 2 | 3;
}

type ClassNames = 'container' | 'strengthIndicator' | 'infoText';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      marginBottom: theme.spacing(1),
      paddingBottom: theme.spacing(1) / 2
    },
    strengthIndicator: {
      position: 'relative',
      top: -5,
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100%'
      }
    },
    infoText: {
      fontSize: '0.85rem',
      marginTop: 12
    }
  });

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordInput extends React.Component<CombinedProps, State> {
  state: State = {
    strength: maybeStrength(this.props.value)
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    const { value } = nextProps;
    this.setState({ strength: maybeStrength(value) });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.currentTarget.value;

    if (this.props.onChange) {
      this.props.onChange(e);
    }
    this.setState({ strength: maybeStrength(value) });
  };

  render() {
    const { strength } = this.state;
    const {
      classes,
      value,
      required,
      disabledReason,
      hideStrengthLabel,
      hideHelperText,
      hideValidation,
      ...rest
    } = this.props;

    return (
      <React.Fragment>
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <HideShowText
              {...rest}
              tooltipText={disabledReason}
              value={value}
              onChange={this.onChange}
              fullWidth
              required={required}
            />
          </Grid>
          {!hideValidation && (
            <Grid item xs={12} className={`${classes.strengthIndicator} py0`}>
              <StrengthIndicator
                strength={strength}
                hideStrengthLabel={hideStrengthLabel}
              />
            </Grid>
          )}
        </Grid>
        {!hideHelperText && (
          <Typography variant="body1" className={classes.infoText}>
            Password must be at least 6 characters and contain at least two of
            the following character classes: uppercase letters, lowercase
            letters, numbers, and punctuation.
          </Typography>
        )}
      </React.Fragment>
    );
  }
}

const maybeStrength = (value?: string) => {

  const strongRegex = /^(?=.{2,}[a-z])(?=.{2,}[A-Z])(?=.{2,}[0-9])(?=.{2,}[!@#\$%\^&\*])(?=.{10,})/;
  const mediumRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  const weekRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

  if (!value || isEmpty(value)) {
    return null;
  } else {
    if(strongRegex.test(value)){
      return 3;
    }else if(mediumRegex.test(value)){
      return 2;
    }else if(weekRegex.test(value)){
      return 1;
    }else{
      return 0;
    }
  }
};

const styled = withStyles(styles);

export default styled(PasswordInput);
