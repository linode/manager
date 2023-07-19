import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { Typography } from 'src/components/Typography';
import { CreateSSHKeyDrawer } from 'src/features/Profile/SSHKeys/CreateSSHKeyDrawer';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import { useProfile, useSSHKeysQuery } from 'src/queries/profile';
import { truncateAndJoinList } from 'src/utilities/stringUtils';

import { GravatarByEmail } from '../GravatarByEmail';
import { PaginationFooter } from '../PaginationFooter/PaginationFooter';
import { TableRowLoading } from '../TableRowLoading/TableRowLoading';

export const MAX_SSH_KEYS_DISPLAY = 25;

const useStyles = makeStyles()((theme: Theme) => ({
  cellCheckbox: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: 50,
  },
  cellUser: {
    width: '30%',
  },
  gravatar: {
    borderRadius: '50%',
    height: 24,
    marginRight: theme.spacing(1),
    width: 24,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  userWrapper: {
    alignItems: 'center',
    display: 'inline-flex',
    marginTop: theme.spacing(0.5),
  },
}));

interface Props {
  authorizedUsers: string[];
  disabled?: boolean;
  setAuthorizedUsers: (usernames: string[]) => void;
}

const UserSSHKeyPanel = (props: Props) => {
  const { classes } = useStyles();
  const { authorizedUsers, disabled, setAuthorizedUsers } = props;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const pagination = usePagination(1);

  const { data: profile } = useProfile();

  const isRestricted = profile?.restricted ?? false;

  // For non-restricted users, this query data will be used to render options
  const {
    data: users,
    error: accountUsersError,
    isLoading: isAccountUsersLoading,
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
    error: sshKeysError,
    isLoading: isSSHKeysLoading,
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
      return <TableRowLoading columns={3} rows={1} />;
    }

    // Special case for restricted users
    if (profile && isRestricted) {
      return (
        <TableRow>
          <TableCell className={classes.cellCheckbox}>
            <Checkbox
              inputProps={{
                'aria-label': `Enable SSH for ${profile.username}`,
              }}
              checked={authorizedUsers.includes(profile.username)}
              disabled={disabled}
              onChange={() => onToggle(profile.username)}
            />
          </TableCell>
          <TableCell className={classes.cellUser}>
            <div className={classes.userWrapper}>
              <GravatarByEmail
                className={classes.gravatar}
                email={profile.email}
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
          <Checkbox
            inputProps={{
              'aria-label': `Enable SSH for ${user.username}`,
            }}
            checked={authorizedUsers.includes(user.username)}
            disabled={disabled || user.ssh_keys.length === 0}
            onChange={() => onToggle(user.username)}
          />
        </TableCell>
        <TableCell className={classes.cellUser}>
          <div className={classes.userWrapper}>
            <GravatarByEmail className={classes.gravatar} email={user.email} />
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
      <Typography className={classes.title} variant="h2">
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
          eventCategory="SSH Key Users Table"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      )}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={() => setIsCreateDrawerOpen(true)}
      >
        Add an SSH Key
      </Button>
      <CreateSSHKeyDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
    </React.Fragment>
  );
};

export default React.memo(UserSSHKeyPanel);
