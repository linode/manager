import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import CheckBox from 'src/components/CheckBox';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Notice from 'src/components/Notice';
import PasswordInput from 'src/components/PasswordInput';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableHeader from 'src/components/TableHeader';

type ClassNames =
  | 'root'
  | 'inner'
  | 'panelBody'
  | 'cellCheckbox'
  | 'cellUser'
  | 'userWrapper'
  | 'gravatar'
  | 'small'
  | 'passwordInputOuter'
  | 'isOptional';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white
  },
  inner: {
    padding: theme.spacing.unit * 3
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`
  },
  cellCheckbox: {
    width: 50,
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit
  },
  cellUser: {
    width: '30%'
  },
  userWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: theme.spacing.unit / 2
  },
  gravatar: {
    borderRadius: '50%',
    marginRight: theme.spacing.unit
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
  handleChange: (value: string) => void;
  heading?: string;
  label?: string;
  noPadding?: boolean;
  required?: boolean;
  placeholder?: string;
  users?: UserSSHKeyObject[];
  disabled?: boolean;
  disabledReason?: string;
  hideStrengthLabel?: boolean;
  className?: string;
  small?: boolean;
  isOptional?: boolean;
  hideHelperText?: boolean;
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
      hideHelperText
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
        <div className={!noPadding ? classes.inner : ''} data-qa-password-input>
          {error && <Notice text={error} error />}
          <PasswordInput
            className={classes.passwordInputOuter}
            required={required}
            disabled={disabled}
            disabledReason={disabledReason || ''}
            autoComplete="new-password"
            value={this.props.password || ''}
            label={label || 'Root Password'}
            placeholder={placeholder || 'Enter a password.'}
            onChange={this.handleChange}
            hideStrengthLabel={hideStrengthLabel}
            hideHelperText={hideHelperText}
          />
          {users && users.length > 0 && this.renderUserSSHKeyTable(users)}
        </div>
      </Paper>
    );
  }

  renderUserSSHKeyTable = (users: UserSSHKeyObject[]) => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <TableHeader title="SSH Keys" />
        <Table isResponsive={false} border spacingBottom={16}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cellCheckbox} />
              <TableCell
                className={classes.cellUser}
                data-qa-table-header="User"
              >
                User
              </TableCell>
              <TableCell data-qa-table-header="SSH Keys">SSH Keys</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(
              ({ gravatarUrl, keys, onSSHKeyChange, selected, username }) => (
                <TableRow key={username} data-qa-ssh-public-key>
                  <TableCell className={classes.cellCheckbox}>
                    <CheckBox checked={selected} onChange={onSSHKeyChange} />
                  </TableCell>
                  <TableCell className={classes.cellUser}>
                    <div className={classes.userWrapper}>
                      <img
                        src={gravatarUrl}
                        className={classes.gravatar}
                        alt={username}
                      />
                      {username}
                    </div>
                  </TableCell>
                  <TableCell>{keys.join(', ')}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.handleChange(e.target.value);
}

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(AccessPanel);
