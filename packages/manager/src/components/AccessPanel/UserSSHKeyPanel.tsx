import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import SSHKeyCreationDrawer from 'src/features/Profile/SSHKeys/SSHKeyCreationDrawer';
import { truncateAndJoinList } from 'src/utilities/stringUtils';

export const MAX_SSH_KEYS_DISPLAY = 100;

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  cellCheckbox: {
    width: 50,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  cellUser: {
    width: '30%',
  },
  userWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: theme.spacing(1) / 2,
  },
  gravatar: {
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
}));

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

interface Props {
  users?: UserSSHKeyObject[];
  error?: string;
  disabled?: boolean;
  onKeyAddSuccess: () => void;
}

type CombinedProps = Props;

const UserSSHKeyPanel: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  /**
   * Success state can be handled here, which makes it hard to clear on e.g. form errors,
   * or it can be handled several levels up, which makes it complex and hard to maintain.
   * Went with here for now since this kind of thing is what Hooks are there for. Can
   * discuss post-POC.
   *
   * In addition, there's never been any error handling for SSH keys, which maybe we should add.
   */
  const [success, setSuccess] = React.useState<boolean>(false);
  const { disabled, error, onKeyAddSuccess, users } = props;

  const handleKeyAddSuccess = () => {
    onKeyAddSuccess();
    setSuccess(true);
    setDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setSuccess(false);
    setDrawerOpen(true);
  };

  const usersWithKeys = users
    ? users.filter((thisUser) => thisUser.keys.length > 0)
    : [];

  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.title}>
        SSH Keys
      </Typography>
      {success && (
        <Notice success data-testid="ssh-success-message">
          <Typography>
            SSH key added successfully.{' '}
            <Link to="/profile/keys">Click here</Link> to manage your keys.
          </Typography>
        </Notice>
      )}
      <Table isResponsive={false} border spacingBottom={16}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellCheckbox} />
            <TableCell className={classes.cellUser} data-qa-table-header="User">
              User
            </TableCell>
            <TableCell data-qa-table-header="SSH Keys">SSH Keys</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error ? (
            <TableRowError colSpan={12} message={error} />
          ) : usersWithKeys.length > 0 ? (
            usersWithKeys.map(
              ({ gravatarUrl, keys, onSSHKeyChange, selected, username }) => (
                <TableRow
                  key={username}
                  data-qa-ssh-public-key
                  data-testid="ssh-public-key"
                >
                  <TableCell className={classes.cellCheckbox}>
                    <CheckBox
                      disabled={disabled}
                      checked={selected}
                      onChange={onSSHKeyChange}
                      inputProps={{
                        'aria-label': `Enable SSH for ${username}`,
                      }}
                    />
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
                  <TableCell>
                    {truncateAndJoinList(keys, MAX_SSH_KEYS_DISPLAY)}
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRowEmptyState
              colSpan={12}
              message={"You don't have any SSH keys available."}
            />
          )}
        </TableBody>
      </Table>
      <Button
        buttonType="secondary"
        onClick={handleOpenDrawer}
        disabled={disabled}
      >
        Add an SSH Key
      </Button>
      <SSHKeyCreationDrawer
        open={drawerOpen}
        onSuccess={handleKeyAddSuccess}
        onCancel={() => setDrawerOpen(false)}
      />
    </React.Fragment>
  );
};

export default React.memo(UserSSHKeyPanel);
