import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Notice from 'src/components/Notice';
import PasswordInput from 'src/components/PasswordInput';
import RenderGuard from 'src/components/RenderGuard';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableHeader from 'src/components/TableHeader';

type ClassNames = 'root'
  | 'inner'
  | 'panelBody'
  | 'cellCheckbox'
  | 'cellUser'
  | 'userWrapper'
  | 'gravatar';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`,
  },
  cellCheckbox: {
    width: 50,
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
  cellUser: {
    width: '30%',
  },
  userWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: theme.spacing.unit / 2,
  },
  gravatar: {
    borderRadius: '50%',
    marginRight: theme.spacing.unit,
  },
});

const styled = withStyles(styles);

export interface Disabled {
  disabled: boolean;
  reason?: string;
}

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
  passwordFieldDisabled?: Disabled;
}

export interface UserSSHKeyObject {
  gravatarUrl: string;
  username: string;
  selected: boolean;
  keys: string[];
  onSSHKeyChange: (e: React.ChangeEvent<HTMLInputElement>, result: boolean) => void;
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
      passwordFieldDisabled,
    } = this.props;

    return (
      <Paper className={classes.root}>
        <div className={!noPadding ? classes.inner : ''} data-qa-password-input>
          {error && <Notice text={error} error />}
          <PasswordInput
            required={required}
            disabled={passwordFieldDisabled && passwordFieldDisabled.disabled}
            disabledReason={passwordFieldDisabled && passwordFieldDisabled.reason}
            value={this.props.password || ''}
            label={label || 'Root Password'}
            placeholder={placeholder || "Enter a password."}
            onChange={this.handleChange}
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
        <TableHeader title="SSH Keys"/>
        <Table isResponsive={false} border spacingBottom={16}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cellCheckbox} />
              <TableCell className={classes.cellUser} data-qa-table-header="User">User</TableCell>
              <TableCell data-qa-table-header="SSH Keys" >SSH Keys</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(({
              gravatarUrl,
              keys,
              onSSHKeyChange,
              selected,
              username,
            }) => (
                <TableRow key={username} data-qa-ssh-public-key>
                  <TableCell className={classes.cellCheckbox}>
                    <CheckBox
                      checked={selected}
                      onChange={onSSHKeyChange}
                    />
                  </TableCell>
                  <TableCell className={classes.cellUser}>
                    <div className={classes.userWrapper}>
                      <img src={gravatarUrl} className={classes.gravatar} alt={username} />
                      {username}
                    </div>
                  </TableCell>
                  <TableCell>{keys.join(', ')}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </React.Fragment>
    )
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.handleChange(e.target.value)
}

export default styled(RenderGuard<CombinedProps>(AccessPanel));
