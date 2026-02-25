import { useDatabaseConnectionPoolsQuery } from '@linode/queries';
import {
  Button,
  CircleProgress,
  ErrorState,
  Hidden,
  Stack,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
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

import { Link } from 'src/components/Link';
import {
  MIN_PAGE_SIZE,
  PAGE_SIZES,
} from 'src/components/PaginationFooter/PaginationFooter.constants';
import {
  CONNECTION_POOL_LABEL_CELL_STYLES,
  MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK,
} from 'src/features/Databases/constants';
import {
  StyledGridContainer,
  StyledLabelTypography,
} from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { makeSettingsItemStyles } from '../../shared.styles';
import { ServiceURI } from '../ServiceURI';
import { DatabaseAddConnectionPoolDrawer } from './DatabaseAddConnectionPoolDrawer';
import { DatabaseConnectionPoolDeleteDialog } from './DatabaseConnectionPoolDeleteDialog';
import { DatabaseConnectionPoolRow } from './DatabaseConnectionPoolRow';
import { DatabaseEditConnectionPoolDrawer } from './DatabaseEditConnectionPoolDrawer';

import type { ConnectionPool, Database } from '@linode/api-v4';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseConnectionPools = ({ database }: Props) => {
  const { classes } = makeSettingsItemStyles();
  const theme = useTheme();
  const isDatabaseInactive = database.status !== 'active';

  const [deletePoolLabelSelection, setDeletePoolLabelSelection] =
    React.useState<null | string>(null);
  const [isAddPoolDrawerOpen, setIsAddPoolDrawerOpen] = React.useState(false);
  const [editPoolSelection, setEditPoolSelection] =
    React.useState<ConnectionPool | null>(null);

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
            resources.{' '}
            <Link to={MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK}>
              Learn more.
            </Link>
          </Typography>
        </Stack>
        <Button
          buttonType="outlined"
          className={classes.actionBtn}
          disabled={isDatabaseInactive}
          onClick={() => setIsAddPoolDrawerOpen(true)}
          TooltipProps={{ placement: 'top' }}
          tooltipText={
            isDatabaseInactive
              ? 'You can only add connection pools to active database clusters.'
              : ''
          }
        >
          Add Pool
        </Button>
      </div>
      {connectionPools && connectionPools.data.length > 0 && (
        <StyledGridContainer display="flex">
          <Grid
            size={{
              md: 1.5,
              xs: 3,
            }}
          >
            <StyledLabelTypography>Service URI</StyledLabelTypography>
          </Grid>
          <ServiceURI database={database} />
        </StyledGridContainer>
      )}
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
              <TableHeaderCell style={CONNECTION_POOL_LABEL_CELL_STYLES}>
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
                <DatabaseConnectionPoolRow
                  key={pool.label}
                  onDelete={() => setDeletePoolLabelSelection(pool.label)}
                  onEdit={() => setEditPoolSelection(pool)}
                  pool={pool}
                />
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
      <DatabaseConnectionPoolDeleteDialog
        databaseId={database.id}
        onClose={() => setDeletePoolLabelSelection(null)}
        open={Boolean(deletePoolLabelSelection)}
        poolLabel={deletePoolLabelSelection ?? ''}
      />
      <DatabaseAddConnectionPoolDrawer
        databaseId={database.id}
        onClose={() => setIsAddPoolDrawerOpen(false)}
        open={isAddPoolDrawerOpen}
      />
      {editPoolSelection && (
        <DatabaseEditConnectionPoolDrawer
          databaseId={database.id}
          onClose={() => setEditPoolSelection(null)}
          open={Boolean(editPoolSelection)}
          pool={editPoolSelection}
        />
      )}
    </>
  );
};
