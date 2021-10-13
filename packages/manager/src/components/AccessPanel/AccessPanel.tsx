import classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SuspenseLoader from 'src/components/SuspenseLoader';
import Divider from '../core/Divider';
import UserSSHKeyPanel from './UserSSHKeyPanel';

const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

type ClassNames = 'root' | 'isOptional' | 'passwordInputOuter';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(3),
    },
    isOptional: {
      '& $passwordInputOuter': {
        marginTop: 0,
      },
    },
    passwordInputOuter: {},
  });

const styled = withStyles(styles);

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
  disabledReason?: string;
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

type CombinedProps = Props & WithStyles<ClassNames>;

class AccessPanel extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      error,
      sshKeyError,
      label,
      required,
      placeholder,
      users,
      disabled,
      disabledReason,
      hideStrengthLabel,
      className,
      isOptional,
      passwordHelperText,
      requestKeys,
    } = this.props;

    return (
      <Paper
        className={classNames(
          {
            [classes.root]: true,
            [classes.isOptional]: isOptional,
          },
          className
        )}
      >
        {error && <Notice text={error} error />}
        <React.Suspense fallback={<SuspenseLoader />}>
          <PasswordInput
            name="password"
            data-qa-password-input
            className={classes.passwordInputOuter}
            required={required}
            disabled={disabled}
            disabledReason={disabledReason || ''}
            autoComplete="off"
            value={this.props.password || ''}
            label={label || 'Root Password'}
            placeholder={placeholder || 'Enter a password.'}
            onChange={this.handleChange}
            hideStrengthLabel={hideStrengthLabel}
            helperText={passwordHelperText}
          />
        </React.Suspense>
        {users && (
          <>
            <Divider spacingTop={44} spacingBottom={20} />
            <UserSSHKeyPanel
              users={users}
              error={sshKeyError}
              disabled={disabled}
              onKeyAddSuccess={requestKeys || (() => null)}
            />
          </>
        )}
      </Paper>
    );
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.handleChange(e.target.value);
}

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(AccessPanel);
