import * as classNames from 'classnames';
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

import Alert from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';

type Props = TextFieldProps & {
  value?: string;
  required?: boolean;
  disabledReason?: string;
  hideStrengthLabel?: boolean;
  hideHelperText?: boolean;
  hideValidation?: boolean;
};

interface State {
  isValidPassword: boolean;
  lengthRequirement: boolean;
  active: boolean;
}

type ClassNames =
  | 'container'
  | 'listItem'
  | 'reqListOuter'
  | 'reqList'
  | 'valid'
  | 'check'
  | 'active';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      paddingBottom: theme.spacing(1) / 2
    },
    reqListOuter: {
      margin: 0,
      width: '100%',
      padding: `${theme.spacing(1)}px ${theme.spacing(2) - 2}px `,
      backgroundColor: theme.bg.offWhiteDT,
      border: `1px solid ${theme.palette.divider}`,
      [theme.breakpoints.up('sm')]: {
        width: 415
      }
    },
    reqList: {
      listStyleType: 'none',
      margin: 0,
      padding: 0
    },
    check: {
      color: theme.color.grey1,
      marginRight: theme.spacing(1),
      position: 'relative',
      top: -1
    },
    active: {
      color: theme.color.red,
      '&$valid': {
        color: theme.color.green
      }
    },
    valid: {},
    listItem: {
      display: 'flex',
      margin: `${theme.spacing(1)}px 0`,
      '& > span': {
        display: 'block'
      }
    }
  });

type CombinedProps = Props & WithStyles<ClassNames>;

class PasswordInput extends React.Component<CombinedProps, State> {
  state: State = {
    isValidPassword: false,
    lengthRequirement: false,
    active: false
  };

  UNSAFE_componentWillReceiveProps(nextProps: CombinedProps) {
    const { value } = nextProps;
    this.setState({
      isValidPassword: passwordValidity(value),
      lengthRequirement: value && value.length >= 6 ? true : false,
      active: value && value.length !== 0 ? true : false
    });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.currentTarget.value;

    if (this.props.onChange) {
      this.props.onChange(e);
    }

    this.setState({
      isValidPassword: passwordValidity(value),
      lengthRequirement: value.length >= 6 ? true : false,
      active: true
    });
  };

  onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value: string = e.currentTarget.value;

    this.setState({
      active: value.length !== 0 && true
    });
  };

  render() {
    const { isValidPassword, lengthRequirement, active } = this.state;
    const {
      classes,
      value,
      required,
      disabledReason,
      hideStrengthLabel,
      hideHelperText,
      hideValidation,
      onBlur,
      ...rest
    } = this.props;

    return (
      <React.Fragment>
        <Grid container alignItems="flex-end" className={classes.container}>
          <Grid item xs={12}>
            <HideShowText
              {...rest}
              tooltipText={disabledReason}
              value={value}
              onChange={this.onChange}
              fullWidth
              required={required}
              onBlur={this.onBlur}
            />
          </Grid>
          {!hideHelperText && (
            <Grid item xs={12}>
              <div className={classes.reqListOuter}>
                <Typography>Password must:</Typography>
                <ul className={classes.reqList}>
                  <li
                    className={classes.listItem}
                    aria-label={
                      lengthRequirement
                        ? 'Password contains enough characters'
                        : 'Password should be at least 6 chars'
                    }
                  >
                    <span
                      className={classNames({
                        [classes.check]: true,
                        [classes.active]: active,
                        [classes.valid]: lengthRequirement
                      })}
                    >
                      {active && !lengthRequirement ? <Alert /> : <Check />}
                    </span>{' '}
                    <Typography component={'span'}>
                      Be at least <strong>6 characters</strong>
                    </Typography>
                  </li>
                  <li
                    className={classes.listItem}
                    aria-label={
                      isValidPassword
                        ? "Password's strength is valid"
                        : "Increase password's strength by adding uppercase letters, lowercase letters, numbers, or punctuation"
                    }
                  >
                    <span
                      className={classNames({
                        [classes.check]: true,
                        [classes.active]: active,
                        [classes.valid]: isValidPassword
                      })}
                    >
                      {active && !isValidPassword ? <Alert /> : <Check />}
                    </span>{' '}
                    <Typography component={'span'}>
                      Contain at least{' '}
                      <strong>two of the following character classes</strong>:
                      uppercase letters, lowercase letters, numbers, and
                      punctuation.
                    </Typography>
                  </li>
                </ul>
              </div>
            </Grid>
          )}
        </Grid>
      </React.Fragment>
    );
  }
}

const passwordValidity = (value?: string) => {
  // This regex checks for the password validity only (no length) which is
  // two of the following character classes: uppercase letters, lowercase letters, numbers, and punctuation.
  // This check aligns with the backend validation
  const regex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]))|((?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]))|((?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])))/;

  if (!value || isEmpty(value)) {
    return false;
  } else {
    if (regex.test(value)) {
      return true;
    } else {
      return false;
    }
  }
};

const styled = withStyles(styles);

export default styled(PasswordInput);
