import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Box from 'src/components/core/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from 'src/components/core/Typography';
import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { EditAPITokenDrawer } from './EditAPITokenDrawer';
import { isWayInTheFuture } from './utils';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { RevokeTokenDialog } from './RevokeTokenDialog';
import { SecretTokenDialog } from 'src/features/Profile/SecretTokenDialog/SecretTokenDialog';
import { StyledTableSortCell } from 'src/components/TableSortCell/StyledTableSortCell';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { APITokenMenu } from './APITokenMenu';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Token } from '@linode/api-v4/lib/profile';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { ViewAPITokenDrawer } from './ViewAPITokenDrawer';
import {
  StyledAddNewWrapper,
  StyledHeadline,
  StyledRootContainer,
} from './APITokenTable.styles';
import {
  useAppTokensQuery,
  usePersonalAccessTokensQuery,
} from 'src/queries/tokens';

export type APITokenType = 'OAuth Client Token' | 'Personal Access Token';

export type APITokenTitle =
  | 'Third Party Access Tokens'
  | 'Personal Access Tokens';

interface Props {
  type: APITokenType;
  title: APITokenTitle;
}

const PREFERENCE_KEY = 'api-tokens';

export const APITokenTable = (props: Props) => {
  const { type, title } = props;

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'created',
      order: 'desc',
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

  const { data, isLoading, error } = useTokenQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { '+order': order, '+order_by': orderBy }
  );

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
      <TableRow
        ariaLabel={token.label}
        key={token.id}
        data-qa-table-row={token.label}
      >
        <TableCell data-qa-token-label>{token.label}</TableCell>
        <TableCell>
          <Typography variant="body1" data-qa-token-created>
            <DateTimeDisplay value={token.created} />
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" data-qa-token-expiry>
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
            token={token}
            type={type}
            isThirdPartyAccessToken={title === 'Third Party Access Tokens'}
            openViewDrawer={openViewDrawer}
            openEditDrawer={openEditDrawer}
            openRevokeDialog={openRevokeDialog}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <StyledRootContainer
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Grid>
          <StyledHeadline variant="h3" data-qa-table={type}>
            {title}
          </StyledHeadline>
        </Grid>
        <StyledAddNewWrapper>
          {type === 'Personal Access Token' && (
            <AddNewLink
              onClick={() => setIsCreateOpen(true)}
              label="Create a Personal Access Token"
            />
          )}
        </StyledAddNewWrapper>
      </StyledRootContainer>
      <Table aria-label={`List of ${title}`}>
        <TableHead>
          <TableRow data-qa-table-head>
            <StyledTableSortCell
              active={orderBy === 'label'}
              label="label"
              direction={order}
              handleClick={handleOrderChange}
            >
              Label
            </StyledTableSortCell>
            <TableSortCell
              active={orderBy === 'created'}
              label="created"
              direction={order}
              handleClick={handleOrderChange}
            >
              Created
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'expiry'}
              label="expiry"
              direction={order}
              handleClick={handleOrderChange}
            >
              Expires
            </TableSortCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderContent()}</TableBody>
      </Table>
      <PaginationFooter
        page={pagination.page}
        pageSize={pagination.pageSize}
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="api tokens table"
      />
      <CreateAPITokenDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        showSecret={showSecret}
      />
      <ViewAPITokenDrawer
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        token={selectedToken}
      />
      <EditAPITokenDrawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        token={selectedToken}
      />
      <RevokeTokenDialog
        open={isRevokeOpen}
        onClose={() => setIsRevokeOpen(false)}
        token={selectedToken}
        type={type}
      />
      <SecretTokenDialog
        title="Personal Access Token"
        open={secretTokenDialogData.open}
        onClose={closeSecretDialog}
        value={secretTokenDialogData.token}
      />
    </Box>
  );
};
