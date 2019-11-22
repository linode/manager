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
  strength: boolean;
  lengthRequirement: boolean;
}

type ClassNames =
  | 'container'
  | 'passWrapper'
  | 'infoText'
  | 'valid'
  | 'invalid';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      paddingBottom: theme.spacing(1) / 2
    },
    passWrapper: {
      minWidth: '100%',
      [theme.breakpoints.up('sm')]: {
        minWidth: `calc(415px + ${theme.spacing(2)}px)`
      }
    },
    infoText: {
      width: '100%',
      padding: theme.spacing(1),
      backgroundColor: theme.bg.offWhite,
      border: `1px solid ${theme.palette.divider}`,
      [theme.breakpoints.up('sm')]: {
        width: 415
      }
    },
    valid: {
      color: theme.color.green
    },
    invalid: {
      color: theme.color.red
    }
  });

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordInput extends React.Component<CombinedProps, State> {
  state: State = {
    strength: false,
    lengthRequirement: false
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    const { value } = nextProps;
    this.setState({
      strength: maybeStrength(value),
      lengthRequirement: value && value.length >= 6 ? true : false
    });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.currentTarget.value;

    if (this.props.onChange) {
      this.props.onChange(e);
    }

    this.setState({
      strength: maybeStrength(value),
      lengthRequirement: value.length >= 6 ? true : false
    });
  };

  render() {
    const { strength, lengthRequirement } = this.state;
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
        <Grid container alignItems="flex-end" className={classes.container}>
          <Grid item className={classes.passWrapper}>
            <HideShowText
              {...rest}
              tooltipText={disabledReason}
              value={value}
              onChange={this.onChange}
              fullWidth
              required={required}
            />
          </Grid>
          {!hideHelperText && (
            <Grid item>
              <Typography variant="body1" className={classes.infoText}>
                Password must be at least{' '}
                <span
                  className={
                    lengthRequirement ? classes.valid : classes.invalid
                  }
                >
                  <strong>6 characters</strong>
                </span>{' '}
                and contain at least{' '}
                <span className={strength ? classes.valid : classes.invalid}>
                  <strong>two of the following character classes</strong>
                </span>
                : uppercase letters, lowercase letters, numbers, and
                punctuation.
              </Typography>
            </Grid>
          )}
        </Grid>
      </React.Fragment>
    );
  }
}

const maybeStrength = (value?: string) => {
  const weekRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]))|((?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]))|((?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])))/;

  if (!value || isEmpty(value)) {
    return false;
  } else {
    if (weekRegex.test(value)) {
      return true;
    } else {
      return false;
    }
  }
};

const styled = withStyles(styles);

export default styled(PasswordInput);
