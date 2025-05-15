import {
  useAppTokensQuery,
  usePersonalAccessTokensQuery,
  useProfile,
} from '@linode/queries';
import { Box, Button, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { StyledTableSortCell } from 'src/components/TableSortCell/StyledTableSortCell';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { PROXY_USER_RESTRICTED_TOOLTIP_TEXT } from 'src/features/Account/constants';
import { SecretTokenDialog } from 'src/features/Profile/SecretTokenDialog/SecretTokenDialog';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

import { APITokenMenu } from './APITokenMenu';
import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';
import { EditAPITokenDrawer } from './EditAPITokenDrawer';
import { RevokeTokenDialog } from './RevokeTokenDialog';
import { isWayInTheFuture } from './utils';
import { ViewAPITokenDrawer } from './ViewAPITokenDrawer';

import type { Token } from '@linode/api-v4';

export type APITokenType = 'OAuth Client Token' | 'Personal Access Token';

export type APITokenTitle =
  | 'Personal Access Tokens'
  | 'Third Party Access Tokens';

interface Props {
  title: APITokenTitle;
  type: APITokenType;
}

const PREFERENCE_KEY = 'api-tokens';

export const APITokenTable = (props: Props) => {
  const { title, type } = props;

  const { data: profile } = useProfile();
  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'created',
    },
    `${PREFERENCE_KEY}-order}`,
    type === 'OAuth Client Token' ? 'oauth' : 'token'
  );
  const pagination = usePagination(1, PREFERENCE_KEY);

  const queryMap = {
    'OAuth Client Token': useAppTokensQuery,
    'Personal Access Token': usePersonalAccessTokensQuery,
  };

  const useTokenQuery = queryMap[type];

  const { data, error, isLoading } = useTokenQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { '+order': order, '+order_by': orderBy }
  );

  const isProxyUser = Boolean(profile?.user_type === 'proxy');

  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [isRevokeOpen, setIsRevokeOpen] = React.useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = React.useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);

  const [selectedTokenId, setSelectedTokenId] = React.useState<number>();
  const selectedToken = data?.data.find(
    (token) => token.id === selectedTokenId
  );

  const [secretTokenDialogData, setSecretTokenDialogData] = React.useState<{
    open: boolean;
    token: string | undefined;
  }>({
    open: false,
    token: undefined,
  });

  const closeSecretDialog = () => {
    setSecretTokenDialogData({ open: false, token: '' });
  };

  const showSecret = (token: string) => {
    setSecretTokenDialogData({ open: true, token });
  };

  const openViewDrawer = (token: Token) => {
    setIsViewOpen(true);
    setSelectedTokenId(token.id);
  };

  const openEditDrawer = (token: Token) => {
    setIsEditOpen(true);
    setSelectedTokenId(token.id);
  };

  const openRevokeDialog = (token: Token) => {
    setIsRevokeOpen(true);
    setSelectedTokenId(token.id);
  };

  const renderContent = () => {
    if (isLoading) {
      return <TableRowLoading columns={4} />;
    }

    if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    }

    return data?.results === 0 ? (
      <TableRowEmpty colSpan={6} />
    ) : (
      renderRows(data?.data ?? [])
    );
  };

  const renderRows = (tokens: Token[]) => {
    return tokens.map((token: Token) => (
      <TableRow data-qa-table-row={token.label} key={token.id}>
        <TableCell data-qa-token-label>{token.label}</TableCell>
        <TableCell>
          <Typography data-qa-token-created variant="body1">
            <DateTimeDisplay value={token.created} />
          </Typography>
        </TableCell>
        <TableCell>
          <Typography data-qa-token-expiry variant="body1">
            {
              /*
             The expiry time of tokens that never expire are returned from the API as
             200 years in the future, so we just need to check that they're at least
             100 years into the future to safely assume they never expire.

             The expiry time of apps that don't expire until revoked come back as 'null'.
             In this case, we display an expiry time of "never" as well.
             */
              token.expiry === null || isWayInTheFuture(token.expiry) ? (
                'never'
              ) : (
                <DateTimeDisplay value={token.expiry} />
              )
            }
          </Typography>
        </TableCell>
        <TableCell actionCell>
          <APITokenMenu
            isProxyUser={isProxyUser}
            isThirdPartyAccessToken={title === 'Third Party Access Tokens'}
            openEditDrawer={openEditDrawer}
            openRevokeDialog={openRevokeDialog}
            openViewDrawer={openViewDrawer}
            token={token}
            type={type}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          minHeight: '42px',
          padding: 0.75,
          paddingLeft: 2,
        }}
      >
        <Typography data-qa-table={type} variant="h3">
          {title}
        </Typography>
        {type === 'Personal Access Token' && (
          <Button
            buttonType="primary"
            disabled={isProxyUser}
            onClick={() => setIsCreateOpen(true)}
            tooltipText={
              isProxyUser ? PROXY_USER_RESTRICTED_TOOLTIP_TEXT : undefined
            }
          >
            Create a Personal Access Token
          </Button>
        )}
      </Paper>
      <Table aria-label={`List of ${title}`}>
        <TableHead>
          <TableRow data-qa-table-head>
            <StyledTableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </StyledTableSortCell>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              handleClick={handleOrderChange}
              label="created"
            >
              Created
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'expiry'}
              direction={order}
              handleClick={handleOrderChange}
              label="expiry"
            >
              Expires
            </TableSortCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="api tokens table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <CreateAPITokenDrawer
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
        showSecret={showSecret}
      />
      <ViewAPITokenDrawer
        onClose={() => setIsViewOpen(false)}
        open={isViewOpen}
        token={selectedToken}
      />
      <EditAPITokenDrawer
        onClose={() => setIsEditOpen(false)}
        open={isEditOpen}
        token={selectedToken}
      />
      <RevokeTokenDialog
        onClose={() => setIsRevokeOpen(false)}
        open={isRevokeOpen}
        token={selectedToken}
        type={type}
      />
      <SecretTokenDialog
        onClose={closeSecretDialog}
        open={secretTokenDialogData.open}
        title="Personal Access Token"
        value={secretTokenDialogData.token}
      />
    </Box>
  );
};
