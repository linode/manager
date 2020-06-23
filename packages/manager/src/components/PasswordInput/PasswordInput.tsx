import { isEmpty } from 'ramda';
import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { Props as TextFieldProps } from 'src/components/TextField';
import * as zxcvbn from 'zxcvbn';
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

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: 'relative',
    paddingBottom: theme.spacing(1) / 2
  },
  requirementsListOuter: {
    margin: 0,
    width: '100%',
    padding: `${theme.spacing(1)}px ${theme.spacing(2) - 2}px `,
    backgroundColor: theme.bg.offWhiteDT,
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('sm')]: {
      width: 415
    }
  },
  requirementsList: {
    margin: 0,
    padding: '0 20px',
    '& li': {
      margin: `${theme.spacing(1)}px 0`,
      '& > span': {
        display: 'block'
      }
    }
  },
  active: {
    color: theme.color.red,
    '&$valid': {
      color: theme.color.green
    }
  },
  valid: {},
  infoText: {
    fontSize: '0.85rem',
    marginTop: 12
  },
  usernameInput: {
    display: 'none'
  }
}));

type CombinedProps = Props;

const PasswordInput: React.FC<CombinedProps> = props => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const {
    value,
    required,
    disabledReason,
    hideStrengthLabel,
    hideHelperText,
    hideValidation,
    ...rest
  } = props;

  const classes = useStyles();

  const strength = React.useMemo(() => maybeStrength(value), [value]);

  return (
    <React.Fragment>
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <input
            type="text"
            name="name"
            aria-hidden="true"
            autoComplete="off"
            className={classes.usernameInput}
            value="root"
            readOnly
          />
          <HideShowText
            {...rest}
            tooltipText={disabledReason}
            value={value}
            onChange={onChange}
            fullWidth
            required={required}
          />
        </Grid>
        {!hideValidation && (
          <Grid item xs={12}>
            <StrengthIndicator
              strength={strength}
              hideStrengthLabel={hideStrengthLabel}
            />
          </Grid>
        )}
        {!hideHelperText && (
          <Grid item xs={12}>
            <div className={classes.requirementsListOuter}>
              <Typography>Password must:</Typography>
              <ul className={classes.requirementsList}>
                <li>
                  <Typography component={'span'}>
                    Be at least <strong>6 characters</strong>
                  </Typography>
                </li>
                <li>
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
};

const maybeStrength = (value?: string) => {
  if (!value || isEmpty(value)) {
    return null;
  } else {
    const score = zxcvbn(value).score;
    if (score === 4) {
      return 3;
    }
    return score;
  }
};

export default React.memo(PasswordInput);
