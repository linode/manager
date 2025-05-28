import { useOAuthClientsQuery } from '@linode/queries';
import { Box, Button } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

import { SecretTokenDialog } from '../SecretTokenDialog/SecretTokenDialog';
import { CreateOAuthClientDrawer } from './CreateOAuthClientDrawer';
import { DeleteOAuthClientDialog } from './DeleteOAuthClientDialog';
import { EditOAuthClientDrawer } from './EditOAuthClientDrawer';
import ActionMenu from './OAuthClientActionMenu';
import { ResetOAuthClientDialog } from './ResetOAuthClientDialog';

const PREFERENCE_KEY = 'oauth-clients';

const OAuthClients = () => {
  const pagination = usePagination(1, PREFERENCE_KEY);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'status',
    },
    PREFERENCE_KEY
  );

  const { data, error, isLoading } = useOAuthClientsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      '+order': order,
      '+order_by': orderBy,
    }
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);

  const [secret, setSecret] = React.useState<string>();
  const isSecretModalOpen = Boolean(secret);

  const [selectedOAuthClientId, setSelectedOAuthClientId] = React.useState('');
  const selectedOAuthClient = data?.data.find(
    (client) => client.id === selectedOAuthClientId
  );

  const showSecret = (s: string) => {
    setSecret(s);
  };

  const renderContent = () => {
    if (error) {
      return (
        <TableRowError
          colSpan={6}
          message="We were unable to load your OAuth Clients."
        />
      );
    }

    if (isLoading) {
      return (
        <TableRowLoading
          columns={5}
          responsive={{ 1: { smDown: true }, 3: { smDown: true } }}
        />
      );
    }

    if (data?.results === 0) {
      return <TableRowEmpty colSpan={6} />;
    }

    return data?.data.map(({ id, label, public: isPublic, redirect_uri }) => (
      <TableRow key={id}>
        <TableCell>{label}</TableCell>
        <Hidden smDown>
          <TableCell>{isPublic ? 'Public' : 'Private'}</TableCell>
        </Hidden>
        <TableCell>{id}</TableCell>
        <Hidden smDown>
          <TableCell>{redirect_uri}</TableCell>
        </Hidden>
        <TableCell actionCell>
          <ActionMenu
            label={label}
            onOpenDeleteDialog={() => {
              setSelectedOAuthClientId(id);
              setIsDeleteDialogOpen(true);
            }}
            onOpenEditDrawer={() => {
              setSelectedOAuthClientId(id);
              setIsEditDrawerOpen(true);
            }}
            onOpenResetDialog={() => {
              setSelectedOAuthClientId(id);
              setIsResetDialogOpen(true);
            }}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <DocumentTitleSegment segment="OAuth Apps" />
      <Box
        display="flex"
        justifyContent="flex-end"
        marginBottom={1}
        paddingRight={{ lg: 0, md: 0, sm: 1, xs: 1 }}
      >
        <Button
          buttonType="primary"
          onClick={() => setIsCreateDrawerOpen(true)}
        >
          Add an OAuth App
        </Button>
      </Box>
      <Table aria-label="List of OAuth Apps">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'public'}
                direction={order}
                handleClick={handleOrderChange}
                label="public"
              >
                Access
              </TableSortCell>
            </Hidden>
            <TableCell>ID</TableCell>
            <Hidden smDown>
              <TableCell>Callback URL</TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderContent()}</TableBody>
      </Table>
      <SecretTokenDialog
        onClose={() => setSecret(undefined)}
        open={isSecretModalOpen}
        title="Client Secret"
        value={secret}
      />
      <DeleteOAuthClientDialog
        id={selectedOAuthClientId}
        label={selectedOAuthClient?.label ?? ''}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <ResetOAuthClientDialog
        id={selectedOAuthClientId}
        label={selectedOAuthClient?.label ?? ''}
        onClose={() => setIsResetDialogOpen(false)}
        open={isResetDialogOpen}
        showSecret={showSecret}
      />
      <CreateOAuthClientDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
        showSecret={showSecret}
      />
      <EditOAuthClientDrawer
        client={selectedOAuthClient}
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
      />
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="oauth clients"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

export const OAuthClientsLazyRoute = createLazyRoute('/profile/clients')({
  component: OAuthClients,
});

export default OAuthClients;
