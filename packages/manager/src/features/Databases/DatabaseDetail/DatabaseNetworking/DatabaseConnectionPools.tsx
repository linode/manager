import { useDatabaseConnectionPoolsQuery } from '@linode/queries';
import {
  Button,
  CircleProgress,
  ErrorState,
  Hidden,
  Stack,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { Pagination } from 'akamai-cds-react-components/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from 'akamai-cds-react-components/Table';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import {
  MIN_PAGE_SIZE,
  PAGE_SIZES,
} from 'src/components/PaginationFooter/PaginationFooter.constants';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import {
  makeSettingsItemStyles,
  StyledActionMenuWrapper,
} from '../../shared.styles';

import type { Database } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseConnectionPools = ({ database }: Props) => {
  const { classes } = makeSettingsItemStyles();
  const theme = useTheme();
  const poolLabelCellStyles = {
    flex: '.5 1 20.5%',
  };

  const pagination = usePaginationV2({
    currentRoute: '/databases/$engine/$databaseId/networking',
    initialPage: 1,
    preferenceKey: `database-connection-pools-pagination`,
  });

  const {
    data: connectionPools,
    error: connectionPoolsError,
    isLoading: connectionPoolsLoading,
  } = useDatabaseConnectionPoolsQuery(database.id, true, {
    page: pagination.page,
    page_size: pagination.pageSize,
  });

  const connectionPoolActions: Action[] = [
    {
      onClick: () => null,
      title: 'Edit', // TODO: UIE-9395 Implement edit functionality
    },
    {
      onClick: () => null, // TODO: UIE-9430 Implement delete functionality
      title: 'Delete',
    },
  ];

  if (connectionPoolsLoading) {
    return <CircleProgress />;
  }

  if (connectionPoolsError) {
    return (
      <ErrorState errorText="There was a problem retrieving your connection pools. Refresh the page or try again later." />
    );
  }

  return (
    <>
      <div className={classes.topSection}>
        <Stack spacing={0.5}>
          <Typography variant="h3">
            Manage PgBouncer Connection Pools
          </Typography>
          <Typography sx={{ maxWidth: '500px' }}>
            Manage PgBouncer connection pools to minimize the use of your server
            resources.
          </Typography>
        </Stack>
        <Button
          buttonType="outlined"
          className={classes.actionBtn}
          disabled={true}
          onClick={() => null}
          TooltipProps={{ placement: 'top' }}
        >
          Add Pool
        </Button>
      </div>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Table
          aria-label={'List of Connection pools'}
          style={
            {
              border: `1px solid ${theme.tokens.alias.Border.Normal}`,
              marginTop: '10px',
              '--token-component-table-header-outlined-border':
                theme.tokens.component.Table.Row.Border,
            } as React.CSSProperties
          }
        >
          <TableHead>
            <TableRow
              headerbackground={
                theme.tokens.component.Table.HeaderNested.Background
              }
              headerborder
            >
              <TableHeaderCell style={poolLabelCellStyles}>
                Pool Label
              </TableHeaderCell>
              <Hidden smDown>
                <TableHeaderCell>Pool Mode</TableHeaderCell>
              </Hidden>
              <Hidden smDown>
                <TableHeaderCell>Pool Size</TableHeaderCell>
              </Hidden>
              <Hidden smDown>
                <TableHeaderCell>Username</TableHeaderCell>
              </Hidden>
              <TableHeaderCell style={{ maxWidth: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {connectionPools?.data.length === 0 ? (
              <TableRow data-testid={'table-row-empty'}>
                <TableCell
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  You don&apos;t have any connection pools added.
                </TableCell>
              </TableRow>
            ) : (
              connectionPools?.data.map((pool) => (
                <TableRow key={`connection-pool-row-${pool.label}`} zebra>
                  <TableCell style={poolLabelCellStyles}>
                    {pool.label}
                  </TableCell>
                  <Hidden smDown>
                    <TableCell>
                      {`${pool.mode.charAt(0).toUpperCase()}${pool.mode.slice(1)}`}
                    </TableCell>
                  </Hidden>
                  <Hidden smDown>
                    <TableCell>{pool.size}</TableCell>
                  </Hidden>
                  <Hidden smDown>
                    <TableCell>
                      {pool.username === null
                        ? 'Reuse inbound user'
                        : pool.username}
                    </TableCell>
                  </Hidden>
                  <StyledActionMenuWrapper>
                    <ActionMenu
                      actionsList={connectionPoolActions}
                      ariaLabel={`Action menu for connection pool ${pool.label}`}
                    />
                  </StyledActionMenuWrapper>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {(connectionPools?.results || 0) > MIN_PAGE_SIZE && (
        <Pagination
          count={connectionPools?.results || 0}
          onPageChange={(e: CustomEvent<number>) =>
            pagination.handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={PAGE_SIZES}
          style={{
            borderLeft: `1px solid ${theme.tokens.alias.Border.Normal}`,
            borderRight: `1px solid ${theme.tokens.alias.Border.Normal}`,
            borderTop: 0,
            marginTop: '0',
          }}
        />
      )}
    </>
  );
};
