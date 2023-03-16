import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import DeleteSSHKeyDialog from 'src/features/Profile/SSHKeys/DeleteSSHKeyDialog';
import SSHKeyActionMenu from 'src/features/Profile/SSHKeys/SSHKeyActionMenu';
import { getSSHKeyFingerprint } from 'src/utilities/ssh-fingerprint';
import SSHKeyCreationDrawer from './SSHKeyCreationDrawer';
import { useSSHKeysQuery } from 'src/queries/profile';
import { usePagination } from 'src/hooks/usePagination';
import { parseAPIDate } from 'src/utilities/date';

const useStyles = makeStyles((theme: Theme) => ({
  sshKeysHeader: {
    margin: 0,
    width: '100%',
  },
  addNewWrapper: {
    '&.MuiGrid-item': {
      paddingTop: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
}));

const preferenceKey = 'ssh-keys';

const SSHKeys = () => {
  const classes = useStyles();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [selectedKeyId, setSelectedKeyId] = React.useState(-1);

  const pagination = usePagination(1, preferenceKey);

  const params = {
    page: pagination.page,
    page_size: pagination.pageSize,
  };

  const { data, isLoading, error } = useSSHKeysQuery(params);

  const selectedKey = data?.data.find((key) => key.id === selectedKeyId);

  const onDelete = (id: number) => {
    setSelectedKeyId(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <TableRowLoading columns={4} />;
  }

  if (data?.results === 0) {
    return <TableRowEmptyState colSpan={4} />;
  }

  if (error) {
    return (
      <TableRowError
        colSpan={4}
        message="Unable to load SSH keys. Please try again."
      />
    );
  }

  return (
    <>
      <DocumentTitleSegment segment="SSH Keys" />
      <Grid
        container
        alignItems="flex-end"
        justifyContent="flex-end"
        className={classes.sshKeysHeader}
      >
        <Grid className={classes.addNewWrapper} item>
          <AddNewLink
            label="Add an SSH Key"
            onClick={() => setIsCreateDrawerOpen(true)}
          />
        </Grid>
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Key</TableCell>
            <Hidden smDown>
              <TableCell>Created</TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.label}</TableCell>
              <TableCell>
                <Typography variant="body1">
                  {key.ssh_key.slice(0, 26)}
                </Typography>
                <Typography variant="body1">
                  Fingerprint: {getSSHKeyFingerprint(key.ssh_key)}
                </Typography>
              </TableCell>
              <Hidden smDown>
                <TableCell>{parseAPIDate(key.created).toRelative()}</TableCell>
              </Hidden>
              <TableCell actionCell>
                <SSHKeyActionMenu
                  id={key.id}
                  label={key.label}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        page={pagination.page}
        pageSize={pagination.pageSize}
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="ssh keys"
      />
      <DeleteSSHKeyDialog
        id={selectedKeyId}
        label={selectedKey?.label}
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
      <SSHKeyCreationDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </>
  );
};

export default SSHKeys;
