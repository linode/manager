import React from 'react';

import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import AddAccessControlDrawer from 'src/features/Databases/DatabaseDetail/AddAccessControlDrawer';
import DatabaseSettingsDeleteClusterDialog from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsDeleteClusterDialog';
import DatabaseSettingsResetPasswordDialog from 'src/features/Databases/DatabaseDetail/DatabaseSettings/DatabaseSettingsResetPasswordDialog';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import DatabaseRow from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { usePagination } from 'src/hooks/usePagination';
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
  showSuspend,
}: Props) => {
  const { data: events } = useInProgressEvents();
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const dbPlatformType = isNewDatabase ? 'new' : 'legacy';
  const pagination = usePagination(1, preferenceKey, dbPlatformType);

  const [
    selectedDatabase,
    setSelectedDatabase,
  ] = React.useState<DatabaseInstance>({} as DatabaseInstance);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [
    isResetPasswordsDialogOpen,
    setIsResetPasswordsDialogOpen,
  ] = React.useState(false);
  const [
    isManageAccessControlsDialogOpen,
    setIsManageAccessControlsDialogOpen,
  ] = React.useState(false);
  const [
    isSuspendClusterDialogOpen,
    setIsSuspendClusterDialogOpen,
  ] = React.useState(false);

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
      <Table
        sx={{ marginTop: '10px' }}
        aria-label={`List of ${
          isNewDatabase ? 'New' : 'Legacy'
        } Database Clusters`}
      >
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Cluster Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            {isNewDatabase && (
              <TableSortCell
                active={orderBy === 'plan'}
                direction={order}
                handleClick={handleOrderChange}
                label="plan"
              >
                Plan
              </TableSortCell>
            )}
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'cluster_size'}
                direction={order}
                handleClick={handleOrderChange}
                label="cluster_size"
              >
                {isNewDatabase ? 'Nodes' : 'Configuration'}
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'engine'}
              direction={order}
              handleClick={handleOrderChange}
              label="engine"
            >
              Engine
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                handleClick={handleOrderChange}
                label="created"
              >
                Created
              </TableSortCell>
            </Hidden>
            {isDatabasesV2GA && isNewDatabase && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((database: DatabaseInstance) => (
            <DatabaseRow
              handlers={{
                handleDelete: () => handleDelete(database),
                handleManageAccessControls: () =>
                  handleManageAccessControls(database),
                handleResetPassword: () => handleResetPassword(database),
                handleSuspend: () => handleSuspend(database),
              }}
              database={database}
              events={events}
              isNewDatabase={isNewDatabase}
              key={database.id}
            />
          ))}
          {data?.length === 0 && (
            <TableRowEmpty
              message={
                isNewDatabase
                  ? 'You don’t have any Aiven Database Clusters created yet. Click Create Database Cluster to create one.'
                  : ''
              }
              colSpan={8}
            />
          )}
        </TableBody>
      </Table>
      <PaginationFooter
        count={results || 0}
        eventCategory="Databases Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
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
