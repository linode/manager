import { Theme } from '@mui/material/styles';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { Notice } from 'src/components/Notice/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { makeStyles } from 'tss-react/mui';
import Divider from '../core/Divider';
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
  password: string | null;
  error?: string;
  handleChange: (value: string) => void;
  heading?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string | JSX.Element;
  tooltipInteractive?: boolean;
  hideStrengthLabel?: boolean;
  className?: string;
  small?: boolean;
  isOptional?: boolean;
  passwordHelperText?: string;
  setAuthorizedUsers?: (usernames: string[]) => void;
  authorizedUsers?: string[];
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
      {error ? <Notice text={error} error /> : null}
      <React.Suspense fallback={<SuspenseLoader />}>
        <PasswordInput
          name="password"
          data-qa-password-input
          className={classes.passwordInputOuter}
          required={required}
          disabled={disabled}
          disabledReason={disabledReason || ''}
          tooltipInteractive={tooltipInteractive}
          autoComplete="off"
          value={password || ''}
          label={label || 'Root Password'}
          placeholder={placeholder || 'Enter a password.'}
          onChange={handleChange}
          hideStrengthLabel={hideStrengthLabel}
          helperText={passwordHelperText}
        />
      </React.Suspense>
      {setAuthorizedUsers !== undefined && authorizedUsers !== undefined ? (
        <>
          <Divider spacingTop={44} spacingBottom={20} />
          <UserSSHKeyPanel
            setAuthorizedUsers={setAuthorizedUsers}
            authorizedUsers={authorizedUsers}
            disabled={disabled}
          />
        </>
      ) : null}
    </Paper>
  );
};

export default AccessPanel;
