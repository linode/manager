import * as React from 'react';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import SSHKeyCreationDrawer from 'src/features/Profile/SSHKeys/SSHKeyCreationDrawer';
import { truncateAndJoinList } from 'src/utilities/stringUtils';
import { useProfile } from 'src/queries/profile';
import { useAccountUsers } from 'src/queries/accountUsers';
import usePagination from 'src/hooks/usePagination';
import { getGravatarUrl } from 'src/utilities/gravatar';
import { TableRowLoading } from '../TableRowLoading/TableRowLoading';

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

interface Props {
  setAuthorizedUsers: (usernames: string[]) => void;
  authorizedUsers: string[];
  disabled?: boolean;
}

const UserSSHKeyPanel = (props: Props) => {
  const classes = useStyles();
  const { disabled, setAuthorizedUsers, authorizedUsers } = props;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const pagination = usePagination(1);

  const { data: profile } = useProfile();
  const { data: users, isLoading, error } = useAccountUsers({
    page: pagination.page,
    page_size: pagination.pageSize,
  });

  const isRestricted = profile?.restricted ?? false;

  const onToggle = (username: string) => {
    if (authorizedUsers.includes(username)) {
      // Remove username
      setAuthorizedUsers(authorizedUsers.filter((u) => u !== username));
    } else {
      setAuthorizedUsers([...authorizedUsers, username]);
    }
  };

  const renderTableBody = () => {
    if (error) {
      return <TableRowError colSpan={12} message={error?.[0].reason} />;
    }

    if (users?.results === 0) {
      return (
        <TableRowEmptyState
          colSpan={12}
          message={"You don't have any SSH keys available."}
        />
      );
    }

    if (isLoading) {
      return <TableRowLoading />;
    }

    return users?.data.map((user) => (
      <TableRow
        key={user.username}
        data-qa-ssh-public-key
        data-testid="ssh-public-key"
      >
        <TableCell className={classes.cellCheckbox}>
          <CheckBox
            disabled={disabled}
            checked={authorizedUsers.includes(user.username)}
            onChange={(_, checked) => onToggle(user.username)}
            inputProps={{
              'aria-label': `Enable SSH for ${user.username}`,
            }}
          />
        </TableCell>
        <TableCell className={classes.cellUser}>
          <div className={classes.userWrapper}>
            <img
              src={getGravatarUrl(user.email)}
              className={classes.gravatar}
              alt={user.username}
            />
            {user.username}
          </div>
        </TableCell>
        <TableCell>
          {truncateAndJoinList(user.ssh_keys, MAX_SSH_KEYS_DISPLAY)}
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
            <TableCell className={classes.cellUser} data-qa-table-header="User">
              User
            </TableCell>
            <TableCell data-qa-table-header="SSH Keys">SSH Keys</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
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
