import { Hidden } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { Pagination } from 'akamai-cds-react-components/Pagination';
import {
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
} from 'akamai-cds-react-components/Table';
import React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import AddAccessControlDrawer from 'src/features/Databases/DatabaseDetail/AddAccessControlDrawer';
import DatabaseSettingsDeleteClusterDialog from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsDeleteClusterDialog';
import DatabaseSettingsResetPasswordDialog from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsResetPasswordDialog';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import DatabaseRow from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useInProgressEvents } from 'src/queries/events/events';

import { DatabaseSettingsSuspendClusterDialog } from '../DatabaseDetail/DatabaseSettings/DatabaseSettingsSuspendClusterDialog';

import type { DatabaseInstance } from '@linode/api-v4/lib/databases';
import type { Order } from '@linode/utilities';

const preferenceKey = 'databases';

interface Props {
  data: DatabaseInstance[] | undefined;
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
  isNewDatabase?: boolean;
  order: 'asc' | 'desc';
  orderBy: string;
  results: number | undefined;
  showSuspend?: boolean;
}
const DatabaseLandingTable = ({
  data,
  handleOrderChange,
  isNewDatabase,
  order,
  orderBy,
  results,
}: Props) => {
  const theme = useTheme();
  const { data: events } = useInProgressEvents();
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const dbPlatformType = isNewDatabase ? 'new' : 'legacy';
  const pagination = usePaginationV2({
    currentRoute: '/databases',
    initialPage: 1,
    preferenceKey,
    queryParamsPrefix: dbPlatformType,
  });
  const PAGE_SIZES = [25, 50, 75, 100];
  const MIN_PAGE_SIZE = 25;

  const [selectedDatabase, setSelectedDatabase] =
    React.useState<DatabaseInstance>({} as DatabaseInstance);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isResetPasswordsDialogOpen, setIsResetPasswordsDialogOpen] =
    React.useState(false);
  const [
    isManageAccessControlsDialogOpen,
    setIsManageAccessControlsDialogOpen,
  ] = React.useState(false);
  const [isSuspendClusterDialogOpen, setIsSuspendClusterDialogOpen] =
    React.useState(false);

  const handleManageAccessControls = (database: DatabaseInstance) => {
    setSelectedDatabase(database);
    setIsManageAccessControlsDialogOpen(true);
  };

  const onCloseAccesControls = () => {
    setIsManageAccessControlsDialogOpen(false);
    setSelectedDatabase({} as DatabaseInstance);
  };

  const handleDelete = (database: DatabaseInstance) => {
    setSelectedDatabase(database);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (database: DatabaseInstance) => {
    setSelectedDatabase(database);
    setIsResetPasswordsDialogOpen(true);
  };

  const handleSuspend = (database: DatabaseInstance) => {
    setSelectedDatabase(database);
    setIsSuspendClusterDialogOpen(true);
  };

  return (
    <>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Table
          aria-label={`List of ${isNewDatabase ? 'New' : 'Legacy'} Database Clusters`}
          style={
            {
              border: `1px solid ${theme.tokens.alias.Border.Normal}`,
              marginTop: '10px',
              minWidth: '800px',
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
              <TableHeaderCell
                sort={() =>
                  handleOrderChange('label', order === 'asc' ? 'desc' : 'asc')
                }
                sortable
                sorted={orderBy === 'label' ? order : undefined}
                style={{
                  flex: '0 1 20.5%',
                }}
              >
                Cluster Label
              </TableHeaderCell>
              <TableHeaderCell
                sort={() =>
                  handleOrderChange('status', order === 'asc' ? 'desc' : 'asc')
                }
                sortable
                sorted={orderBy === 'status' ? order : undefined}
              >
                Status
              </TableHeaderCell>
              {isNewDatabase && (
                <TableHeaderCell
                  sort={() =>
                    handleOrderChange('type', order === 'asc' ? 'desc' : 'asc')
                  }
                  sortable
                  sorted={orderBy === 'type' ? order : undefined}
                >
                  Plan
                </TableHeaderCell>
              )}
              <Hidden smDown>
                <TableHeaderCell
                  sort={() =>
                    handleOrderChange(
                      'cluster_size',
                      order === 'asc' ? 'desc' : 'asc'
                    )
                  }
                  sortable
                  sorted={orderBy === 'cluster_size' ? order : undefined}
                >
                  {isNewDatabase ? 'Nodes' : 'Configuration'}
                </TableHeaderCell>
              </Hidden>
              <TableHeaderCell
                sort={() =>
                  handleOrderChange('engine', order === 'asc' ? 'desc' : 'asc')
                }
                sortable
                sorted={orderBy === 'engine' ? order : undefined}
              >
                Engine
              </TableHeaderCell>
              <Hidden mdDown>
                <TableHeaderCell
                  sort={() =>
                    handleOrderChange(
                      'region',
                      order === 'asc' ? 'desc' : 'asc'
                    )
                  }
                  sortable
                  sorted={orderBy === 'region' ? order : undefined}
                >
                  Region
                </TableHeaderCell>
              </Hidden>
              <Hidden lgDown>
                <TableHeaderCell
                  sort={() =>
                    handleOrderChange(
                      'created',
                      order === 'asc' ? 'desc' : 'asc'
                    )
                  }
                  sortable
                  sorted={orderBy === 'created' ? order : undefined}
                >
                  Created
                </TableHeaderCell>
              </Hidden>
              {isDatabasesV2GA && isNewDatabase && (
                <TableHeaderCell style={{ maxWidth: 40 }} />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length === 0 ? (
              <TableRowEmpty
                colSpan={8}
                message={
                  isNewDatabase
                    ? 'You don’t have any Aiven Database Clusters created yet. Click Create Database Cluster to create one.'
                    : ''
                }
              />
            ) : (
              data?.map((database: DatabaseInstance) => (
                <DatabaseRow
                  database={database}
                  events={events}
                  handlers={{
                    handleDelete: () => handleDelete(database),
                    handleManageAccessControls: () =>
                      handleManageAccessControls(database),
                    handleResetPassword: () => handleResetPassword(database),
                    handleSuspend: () => handleSuspend(database),
                  }}
                  isNewDatabase={isNewDatabase}
                  key={database.id}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {(results || 0) > MIN_PAGE_SIZE && (
        <Pagination
          count={results || 0}
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
          }}
        />
      )}

      {isNewDatabase && (
        <>
          <DatabaseLogo />
          {selectedDatabase && (
            <>
              <DatabaseSettingsDeleteClusterDialog
                databaseEngine={selectedDatabase.engine}
                databaseID={selectedDatabase.id}
                databaseLabel={selectedDatabase?.label}
                onClose={() => setIsDeleteDialogOpen(false)}
                open={isDeleteDialogOpen}
              />
              <DatabaseSettingsResetPasswordDialog
                databaseEngine={selectedDatabase.engine}
                databaseID={selectedDatabase.id}
                onClose={() => setIsResetPasswordsDialogOpen(false)}
                open={isResetPasswordsDialogOpen}
              />
            </>
          )}
        </>
      )}
      <DatabaseSettingsSuspendClusterDialog
        databaseEngine={selectedDatabase.engine}
        databaseId={selectedDatabase.id}
        databaseLabel={selectedDatabase.label}
        onClose={() => setIsSuspendClusterDialogOpen(false)}
        open={isSuspendClusterDialogOpen}
      />
      <AddAccessControlDrawer
        database={selectedDatabase}
        onClose={onCloseAccesControls}
        open={isManageAccessControlsDialogOpen}
      />
    </>
  );
};

export default DatabaseLandingTable;
