import { Theme } from '@mui/material/styles';
import * as React from 'react';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Typography from 'src/components/core/Typography';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import SSHKeyCreationDrawer from 'src/features/Profile/SSHKeys/CreateSSHKeyDrawer';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import { useProfile, useSSHKeysQuery } from 'src/queries/profile';
import { truncateAndJoinList } from 'src/utilities/stringUtils';
import { makeStyles } from 'tss-react/mui';
import { GravatarByEmail } from '../GravatarByEmail';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { TableRowLoading } from '../TableRowLoading/TableRowLoading';

export const MAX_SSH_KEYS_DISPLAY = 25;

const useStyles = makeStyles()((theme: Theme) => ({
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
    width: 24,
    height: 24,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  setAuthorizedUsers: (usernames: string[]) => void;
  authorizedUsers: string[];
  disabled?: boolean;
}

const UserSSHKeyPanel = (props: Props) => {
  const { classes } = useStyles();
  const { disabled, setAuthorizedUsers, authorizedUsers } = props;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const pagination = usePagination(1);

  const { data: profile } = useProfile();

  const isRestricted = profile?.restricted ?? false;

  // For non-restricted users, this query data will be used to render options
  const {
    data: users,
    isLoading: isAccountUsersLoading,
    error: accountUsersError,
  } = useAccountUsers(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    }
    // { ssh_keys: { '+neq': null } }
  );

  // Restricted users can't hit /account/users.
  // For restricted users, we assume that they can only choose their own SSH keys,
  // so we use this query to get them so we can display their labels.
  // Notice how the query is only enabled when the user is restricted.
  // Also notice this query usually requires us to handle pagination, BUT,
  // because we truncate the results, we don't need all items.
  const {
    data: sshKeys,
    isLoading: isSSHKeysLoading,
    error: sshKeysError,
  } = useSSHKeysQuery({}, {}, isRestricted);

  const sshKeyLabels = sshKeys?.data.map((key) => key.label) ?? [];
  const sshKeyTotal = sshKeys?.results ?? 0;

  const onToggle = (username: string) => {
    if (authorizedUsers.includes(username)) {
      // Remove username
      setAuthorizedUsers(authorizedUsers.filter((u) => u !== username));
    } else {
      setAuthorizedUsers([...authorizedUsers, username]);
    }
  };

  const isLoading = isRestricted ? isSSHKeysLoading : isAccountUsersLoading;
  const error = isRestricted ? sshKeysError : accountUsersError;

  const renderTableBody = () => {
    if (error) {
      return <TableRowError colSpan={3} message={error?.[0].reason} />;
    }

    if (isRestricted && sshKeys?.results === 0) {
      return (
        <TableRowEmpty
          colSpan={3}
          message={"You don't have any SSH keys available."}
        />
      );
    }

    if (isLoading) {
      return <TableRowLoading rows={1} columns={3} />;
    }

    // Special case for restricted users
    if (profile && isRestricted) {
      return (
        <TableRow>
          <TableCell className={classes.cellCheckbox}>
            <CheckBox
              disabled={disabled}
              checked={authorizedUsers.includes(profile.username)}
              onChange={() => onToggle(profile.username)}
              inputProps={{
                'aria-label': `Enable SSH for ${profile.username}`,
              }}
            />
          </TableCell>
          <TableCell className={classes.cellUser}>
            <div className={classes.userWrapper}>
              <GravatarByEmail
                email={profile.email}
                className={classes.gravatar}
              />
              {profile.username}
            </div>
          </TableCell>
          <TableCell>
            {truncateAndJoinList(
              sshKeyLabels,
              MAX_SSH_KEYS_DISPLAY,
              sshKeyTotal
            )}
          </TableCell>
        </TableRow>
      );
    }

    return users?.data.map((user) => (
      <TableRow key={user.username}>
        <TableCell className={classes.cellCheckbox}>
          <CheckBox
            disabled={disabled || user.ssh_keys.length === 0}
            checked={authorizedUsers.includes(user.username)}
            onChange={() => onToggle(user.username)}
            inputProps={{
              'aria-label': `Enable SSH for ${user.username}`,
            }}
          />
        </TableCell>
        <TableCell className={classes.cellUser}>
          <div className={classes.userWrapper}>
            <GravatarByEmail email={user.email} className={classes.gravatar} />
            {user.username}
          </div>
        </TableCell>
        <TableCell>
          {user.ssh_keys.length === 0
            ? 'None'
            : truncateAndJoinList(user.ssh_keys, MAX_SSH_KEYS_DISPLAY)}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.title}>
        SSH Keys
      </Typography>
      <Table spacingBottom={16}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellCheckbox} />
            <TableCell className={classes.cellUser}>User</TableCell>
            <TableCell>SSH Keys</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      {!isRestricted && (
        <PaginationFooter
          count={users?.results ?? 0}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          eventCategory="SSH Key Users Table"
        />
      )}
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
