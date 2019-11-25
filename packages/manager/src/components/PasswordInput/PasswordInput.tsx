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
  strength: boolean;
  lengthRequirement: boolean;
}

type ClassNames = 'container' | 'listItem' | 'reqList' | 'valid' | 'check';

const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      paddingBottom: theme.spacing(1) / 2
    },
    reqList: {
      listStyleType: 'none',
      margin: 0,
      width: '100%',
      padding: `${theme.spacing(1)}px ${theme.spacing(2) - 2}px `,
      backgroundColor: theme.bg.offWhite,
      border: `1px solid ${theme.palette.divider}`,
      [theme.breakpoints.up('sm')]: {
        width: 415
      }
    },
    check: {
      color: theme.color.red,
      marginRight: theme.spacing(1),
      position: 'relative',
      top: -1,
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
          {!hideHelperText && (
            <Grid item xs={12}>
              <ul className={classes.reqList}>
                <Typography component={'span'}>Password must</Typography>
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
                      [classes.valid]: lengthRequirement
                    })}
                  >
                    <Check />
                  </span>{' '}
                  <Typography component={'span'}>
                    Be at least <strong>6 characters</strong>
                  </Typography>
                </li>
                <li
                  className={classes.listItem}
                  aria-label={
                    strength
                      ? "Password's strength is valid"
                      : "Increase password's strength by adding uppercase letters, lowercase letters, numbers, or punctuation"
                  }
                >
                  <span
                    className={classNames({
                      [classes.check]: true,
                      [classes.valid]: strength
                    })}
                  >
                    <Check />
                  </span>{' '}
                  <Typography component={'span'}>
                    Contain at least{' '}
                    <strong>two of the following character classes</strong>:
                    uppercase letters, lowercase letters, numbers, and
                    punctuation.
                  </Typography>
                </li>
              </ul>
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
