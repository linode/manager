import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import UserSSHKeyPanel from './UserSSHKeyPanel';
const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));
import SuspenseLoader from 'src/components/SuspenseLoader';

type ClassNames =
  | 'root'
  | 'inner'
  | 'panelBody'
  | 'small'
  | 'passwordInputOuter'
  | 'isOptional';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
      marginTop: theme.spacing(3),
      backgroundColor: theme.cmrBGColors.bgPaper
    },
    inner: {
      padding: theme.spacing(3)
    },
    panelBody: {
      padding: `${theme.spacing(3)}px 0 ${theme.spacing(1)}px`
    },
    small: {
      '&$root': {
        marginTop: 0
      },
      '& $passwordInputOuter': {
        marginTop: 0
      },
      '& .input': {
        minHeight: 32,
        '& input': {
          padding: 8
        }
      }
    },
    passwordInputOuter: {},
    isOptional: {
      '& $passwordInputOuter': {
        marginTop: 0
      }
    }
  });

const styled = withStyles(styles);

interface Props {
  password: string | null;
  error?: string;
  sshKeyError?: string;
  handleChange: (value: string) => void;
  heading?: string;
  label?: string;
  noPadding?: boolean;
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
      noPadding,
      required,
      placeholder,
      users,
      disabled,
      disabledReason,
      hideStrengthLabel,
      className,
      small,
      isOptional,
      passwordHelperText,
      requestKeys
    } = this.props;

    return (
      <Paper
        className={classNames(
          {
            [classes.root]: true,
            [classes.small]: small,
            [classes.isOptional]: isOptional
          },
          className
        )}
      >
        <div className={!noPadding ? classes.inner : ''}>
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
            <UserSSHKeyPanel
              users={users}
              error={sshKeyError}
              disabled={disabled}
              onKeyAddSuccess={requestKeys || (() => null)}
            />
          )}
        </div>
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
