import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import DeleteSSHKeyDialog from 'src/features/Profile/SSHKeys/DeleteSSHKeyDialog';
import EditSSHKeyDrawer from './EditSSHKeyDrawer';
import Grid from '@mui/material/Unstable_Grid2';
import Hidden from 'src/components/core/Hidden';
import SSHKeyActionMenu from 'src/features/Profile/SSHKeys/SSHKeyActionMenu';
import SSHKeyCreationDrawer from './CreateSSHKeyDrawer';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { getSSHKeyFingerprint } from 'src/utilities/ssh-fingerprint';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { parseAPIDate } from 'src/utilities/date';
import { styled } from '@mui/material/styles';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { usePagination } from 'src/hooks/usePagination';
import { useSSHKeysQuery } from 'src/queries/profile';

const PREFERENCE_KEY = 'ssh-keys';

export const SSHKeys = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [selectedKeyId, setSelectedKeyId] = React.useState(-1);

  const pagination = usePagination(1, PREFERENCE_KEY);

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

  const onEdit = (id: number) => {
    setSelectedKeyId(id);
    setIsEditDrawerOpen(true);
  };

  const renderTableBody = React.useCallback(() => {
    if (isLoading) {
      return <TableRowLoading columns={4} />;
    }

    if (data?.results === 0) {
      return <TableRowEmpty colSpan={4} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={4}
          message="Unable to load SSH keys. Please try again."
        />
      );
    }

    return data?.data.map((key) => (
      <TableRow key={key.id}>
        <TableCell>{key.label}</TableCell>
        <TableCell>
          <Typography variant="body1">{key.ssh_key.slice(0, 26)}</Typography>
          <Typography variant="body1">
            Fingerprint: {getSSHKeyFingerprint(key.ssh_key)}
          </Typography>
        </TableCell>
        <Hidden smDown>
          <TableCell>{parseAPIDate(key.created).toRelative()}</TableCell>
        </Hidden>
        <TableCell actionCell>
          <SSHKeyActionMenu
            onDelete={() => onDelete(key.id)}
            onEdit={() => onEdit(key.id)}
          />
        </TableCell>
      </TableRow>
    ));
  }, [data, error, isLoading]);

  return (
    <>
      <DocumentTitleSegment segment="SSH Keys" />
      <Grid
        container
        alignItems="flex-end"
        justifyContent="flex-end"
        spacing={2}
        sx={{
          margin: 0,
          width: '100%',
        }}
      >
        <StyledAddNewWrapperGridItem>
          <AddNewLink
            label="Add an SSH Key"
            onClick={() => setIsCreateDrawerOpen(true)}
          />
        </StyledAddNewWrapperGridItem>
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
        <TableBody>{renderTableBody()}</TableBody>
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
      <EditSSHKeyDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        sshKey={selectedKey}
      />
      <SSHKeyCreationDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </>
  );
};

const StyledAddNewWrapperGridItem = styled(Grid)(({ theme }) => ({
  paddingTop: 0,
  paddingRight: 0,

  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));
