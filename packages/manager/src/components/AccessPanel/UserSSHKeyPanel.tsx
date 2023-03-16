import * as React from 'react';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
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
    marginTop: theme.spacing(0.5),
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

const UserSSHKeyPanel = (props: Props) => {
  const classes = useStyles();

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const { disabled, error, onKeyAddSuccess, users } = props;

  const usersWithKeys = users
    ? users.filter((thisUser) => thisUser.keys?.length > 0)
    : [];

  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.title}>
        SSH Keys
      </Typography>
      <Table spacingBottom={16}>
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
        buttonType="outlined"
        onClick={() => setIsCreateDrawerOpen(true)}
        compactX
        disabled={disabled}
      >
        Add an SSH Key
      </Button>
      <SSHKeyCreationDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </React.Fragment>
  );
};

export default React.memo(UserSSHKeyPanel);
