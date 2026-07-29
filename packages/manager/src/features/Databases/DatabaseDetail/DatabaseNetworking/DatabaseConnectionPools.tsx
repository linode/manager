import {
  Button,
  Icon,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseConnectionPoolsQuery } from '@linode/queries';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Link } from 'src/components/Link';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { DEFAULT_PAGE_SIZES } from 'src/features/Databases/constants';
import {
  CONNECTION_POOL_LABEL_CELL_STYLES,
  MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK,
} from 'src/features/Databases/constants';
import { useBreakpoint } from 'src/features/Databases/hooks/useBreakpoint';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { makeSettingsItemStyles } from '../../shared.styles';
import { CircleProgress } from '../../shared/CircleProgress/CircleProgress';
import { ErrorState } from '../../shared/ErrorState/ErrorState';
import { Stack } from '../../shared/Stack/Stack';
import styles from '../DatabaseDetail.module.css';
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
  const showFromSmUp = useBreakpoint('up', 'sm');
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

  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database.private_network?.public_access;

  return (
    <>
      <div className={classes.topSection}>
        <Stack spacing={Spacing.S4}>
          <h3 style={{ margin: 0 }}>Manage PgBouncer Connection Pools</h3>
          <p style={{ maxWidth: '500px', margin: 0 }}>
            Manage PgBouncer connection pools to minimize the use of your server
            resources.{' '}
            <Link to={MANAGE_CONNECTION_POOLS_LEARN_MORE_LINK}>
              Learn more.
            </Link>
          </p>
        </Stack>
        <Tooltip
          disabled={!isDatabaseInactive}
          tooltipText="You can only add connection pools to active database clusters."
        >
          <Button
            className={classes.actionBtn}
            disabled={isDatabaseInactive}
            onClick={() => setIsAddPoolDrawerOpen(true)}
          >
            Add Pool
            {isDatabaseInactive ? <Icon icon="info-outline" size="m" /> : null}
          </Button>
        </Tooltip>
      </div>
      {connectionPools && connectionPools.data.length > 0 && (
        <div className={styles.summaryLabelValueContainer}>
          <div className={styles.summaryLabelColumn}>
            <p>{hasPublicVPC ? 'Public Service URI' : 'Service URI'}</p>
          </div>
          <div className={styles.summaryValueColumn}>
            <ServiceURI database={database} />
          </div>
          {hasPublicVPC && (
            <>
              <div className={styles.summaryLabelColumn}>
                <p>Private Service URI</p>
              </div>
              <div className={styles.summaryValueColumn}>
                <ServiceURI database={database} showPrivateVPC />
              </div>
            </>
          )}
        </div>
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
              {showFromSmUp && <TableHeaderCell>Pool Mode</TableHeaderCell>}
              {showFromSmUp && <TableHeaderCell>Pool Size</TableHeaderCell>}
              {showFromSmUp && <TableHeaderCell>Username</TableHeaderCell>}
              <TableHeaderCell style={{ maxWidth: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {connectionPoolsLoading && <CircleProgress />}
            {connectionPoolsError && (
              <ErrorState errorText="There was a problem retrieving your connection pools. Refresh the page or try again later." />
            )}
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
                  databaseStatus={database.status}
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
          pageSizes={DEFAULT_PAGE_SIZES}
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
