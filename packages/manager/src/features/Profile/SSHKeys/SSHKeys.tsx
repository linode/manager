import { Button, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import DeleteSSHKeyDialog from 'src/features/Profile/SSHKeys/DeleteSSHKeyDialog';
import SSHKeyActionMenu from 'src/features/Profile/SSHKeys/SSHKeyActionMenu';
import { usePagination } from 'src/hooks/usePagination';
import { useSSHKeysQuery } from 'src/queries/profile/profile';
import { parseAPIDate } from 'src/utilities/date';
import { getSSHKeyFingerprint } from 'src/utilities/ssh-fingerprint';

import { CreateSSHKeyDrawer } from './CreateSSHKeyDrawer';
import EditSSHKeyDrawer from './EditSSHKeyDrawer';

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

  const { data, error, isLoading } = useSSHKeysQuery(params);

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
        spacing={2}
        sx={{
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          margin: 0,
          width: '100%',
        }}
      >
        <StyledAddNewWrapperGridItem>
          <Button
            buttonType="primary"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            Add an SSH Key
          </Button>
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
        count={data?.results ?? 0}
        eventCategory="ssh keys"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <DeleteSSHKeyDialog
        id={selectedKeyId}
        label={selectedKey?.label}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <EditSSHKeyDrawer
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
        sshKey={selectedKey}
      />
      <CreateSSHKeyDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
    </>
  );
};

const StyledAddNewWrapperGridItem = styled(Grid)(({ theme }) => ({
  paddingRight: 0,
  paddingTop: 0,

  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));

export const SSHKeysLazyRoute = createLazyRoute('/profile/keys')({
  component: SSHKeys,
});
