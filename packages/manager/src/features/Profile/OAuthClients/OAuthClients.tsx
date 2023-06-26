import * as React from 'react';
import Box from 'src/components/core/Box';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import ActionMenu from './OAuthClientActionMenu';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useOAuthClientsQuery } from 'src/queries/accountOAuth';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { DeleteOAuthClientDialog } from './DeleteOAuthClientDialog';
import { ResetOAuthClientDialog } from './ResetOAuthClientDialog';
import { usePagination } from 'src/hooks/usePagination';
import { useOrder } from 'src/hooks/useOrder';
import { CreateOAuthClientDrawer } from './CreateOAuthClientDrawer';
import { EditOAuthClientDrawer } from './EditOAuthClientDrawer';
import { SecretTokenDialog } from '../SecretTokenDialog/SecretTokenDialog';

const PREFERENCE_KEY = 'oauth-clients';

const OAuthClients = () => {
  const pagination = usePagination(1, PREFERENCE_KEY);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'status',
      order: 'desc',
    },
    PREFERENCE_KEY
  );

  const { data, error, isLoading } = useOAuthClientsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      '+order_by': orderBy,
      '+order': order,
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

    return data?.data.map(({ id, label, redirect_uri, public: isPublic }) => (
      <TableRow ariaLabel={label} key={id}>
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
            onOpenResetDialog={() => {
              setSelectedOAuthClientId(id);
              setIsResetDialogOpen(true);
            }}
            onOpenDeleteDialog={() => {
              setSelectedOAuthClientId(id);
              setIsDeleteDialogOpen(true);
            }}
            onOpenEditDrawer={() => {
              setSelectedOAuthClientId(id);
              setIsEditDrawerOpen(true);
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
        paddingRight={{ xs: 1, sm: 1, md: 0, lg: 0 }}
        marginBottom={1}
      >
        <AddNewLink
          label="Add an OAuth App"
          onClick={() => setIsCreateDrawerOpen(true)}
        />
      </Box>
      <Table aria-label="List of OAuth Apps">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              label="label"
              direction={order}
              handleClick={handleOrderChange}
            >
              Label
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'public'}
                label="public"
                direction={order}
                handleClick={handleOrderChange}
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
        title="Client Secret"
        open={isSecretModalOpen}
        onClose={() => setSecret(undefined)}
        value={secret}
      />
      <DeleteOAuthClientDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        label={selectedOAuthClient?.label ?? ''}
        id={selectedOAuthClientId}
      />
      <ResetOAuthClientDialog
        open={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        label={selectedOAuthClient?.label ?? ''}
        id={selectedOAuthClientId}
        showSecret={showSecret}
      />
      <CreateOAuthClientDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        showSecret={showSecret}
      />
      <EditOAuthClientDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        client={selectedOAuthClient}
      />
      <PaginationFooter
        page={pagination.page}
        pageSize={pagination.pageSize}
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="oauth clients"
      />
    </>
  );
};

export default OAuthClients;
