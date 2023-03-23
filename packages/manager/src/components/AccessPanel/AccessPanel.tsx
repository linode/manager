import { Theme } from '@mui/material/styles';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Notice from 'src/components/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { makeStyles } from 'tss-react/mui';
import Divider from '../core/Divider';
import UserSSHKeyPanel from './UserSSHKeyPanel';

const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

const useStyles = makeStyles<void, 'passwordInputOuter'>()(
  (theme: Theme, _params, classes) => ({
    root: {
      marginTop: theme.spacing(3),
    },
    isOptional: {
      [`& .${classes.passwordInputOuter}`]: {
        marginTop: 0,
      },
    },
    passwordInputOuter: {},
  })
);

interface Props {
  password: string | null;
  error?: string;
  sshKeyError?: string;
  handleChange: (value: string) => void;
  heading?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  users?: UserSSHKeyObject[];
  requestKeys?: () => void;
  disabled?: boolean;
  disabledReason?: string | JSX.Element;
  tooltipInteractive?: boolean;
  hideStrengthLabel?: boolean;
  className?: string;
  small?: boolean;
  isOptional?: boolean;
  passwordHelperText?: string;
}

export interface UserSSHKeyObject {
  gravatarUrl: string;
  username: string;
  selected: boolean;
  keys: string[];
  onSSHKeyChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    result: boolean
  ) => void;
}

const AccessPanel = (props: Props) => {
  const {
    error,
    sshKeyError,
    label,
    required,
    placeholder,
    users,
    disabled,
    disabledReason,
    tooltipInteractive,
    hideStrengthLabel,
    className,
    isOptional,
    passwordHelperText,
    requestKeys,
    password,
    handleChange: _handleChange,
  } = props;

  const { classes, cx } = useStyles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    _handleChange(e.target.value);

  return (
    <Paper
      className={cx(
        {
          [classes.root]: true,
          [classes.isOptional]: isOptional,
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
      {users ? (
        <>
          <Divider spacingTop={44} spacingBottom={20} />
          <UserSSHKeyPanel
            users={users}
            error={sshKeyError}
            disabled={disabled}
            onKeyAddSuccess={requestKeys || (() => null)}
          />
        </>
      ) : null}
    </Paper>
  );
};

export default AccessPanel;
