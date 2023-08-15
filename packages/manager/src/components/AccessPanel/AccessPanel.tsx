import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Notice } from 'src/components/Notice/Notice';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { Paper } from 'src/components/Paper';

import { Divider } from '../Divider';
import UserSSHKeyPanel from './UserSSHKeyPanel';

const PasswordInput = React.lazy(
  () => import('src/components/PasswordInput/PasswordInput')
);

const useStyles = makeStyles<void, 'passwordInputOuter'>()(
  (theme: Theme, _params, classes) => ({
    isOptional: {
      [`& .${classes.passwordInputOuter}`]: {
        marginTop: 0,
      },
    },
    passwordInputOuter: {},
    root: {
      marginTop: theme.spacing(3),
    },
  })
);

interface Props {
  authorizedUsers?: string[];
  className?: string;
  disabled?: boolean;
  disabledReason?: JSX.Element | string;
  error?: string;
  handleChange: (value: string) => void;
  heading?: string;
  hideStrengthLabel?: boolean;
  isOptional?: boolean;
  label?: string;
  password: null | string;
  passwordHelperText?: string;
  placeholder?: string;
  required?: boolean;
  setAuthorizedUsers?: (usernames: string[]) => void;
  small?: boolean;
  tooltipInteractive?: boolean;
}

const AccessPanel = (props: Props) => {
  const {
    authorizedUsers,
    className,
    disabled,
    disabledReason,
    error,
    handleChange: _handleChange,
    hideStrengthLabel,
    isOptional,
    label,
    password,
    passwordHelperText,
    placeholder,
    required,
    setAuthorizedUsers,
    tooltipInteractive,
  } = props;

  const { classes, cx } = useStyles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    _handleChange(e.target.value);

  return (
    <Paper
      className={cx(
        {
          [classes.isOptional]: isOptional,
          [classes.root]: true,
        },
        className
      )}
    >
      {error ? <Notice variant="error" text={error} /> : null}
      <React.Suspense fallback={<SuspenseLoader />}>
        <PasswordInput
          autoComplete="off"
          className={classes.passwordInputOuter}
          data-qa-password-input
          disabled={disabled}
          disabledReason={disabledReason || ''}
          helperText={passwordHelperText}
          hideStrengthLabel={hideStrengthLabel}
          label={label || 'Root Password'}
          name="password"
          onChange={handleChange}
          placeholder={placeholder || 'Enter a password.'}
          required={required}
          tooltipInteractive={tooltipInteractive}
          value={password || ''}
        />
      </React.Suspense>
      {setAuthorizedUsers !== undefined && authorizedUsers !== undefined ? (
        <>
          <Divider spacingBottom={20} spacingTop={44} />
          <UserSSHKeyPanel
            authorizedUsers={authorizedUsers}
            disabled={disabled}
            setAuthorizedUsers={setAuthorizedUsers}
          />
        </>
      ) : null}
    </Paper>
  );
};

export default AccessPanel;
