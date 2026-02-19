import { useDatabasesQuery } from '@linode/queries';
import { CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  SubnetDatabaseRow,
  SubnetDatabasesTableRowHead,
} from './SubnetDatabaseRow';

import type { SubnetAssignedDatabaseData } from '@linode/api-v4';
interface Props {
  databasesData: SubnetAssignedDatabaseData[];
}

export const SubnetDatabasesTable = ({ databasesData }: Props) => {
  const theme = useTheme();

  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(1);

  const assignedDatabasesMap = () => {
    const databaseMap: Record<number, SubnetAssignedDatabaseData> = {};
    databasesData.forEach((assignedDatabase) => {
      databaseMap[assignedDatabase.id] = assignedDatabase;
    });
    return databaseMap;
  };

  // Create filter using unique database IDs from the assigned databases
  const makeDatabaseIDsFilter = () => {
    const uniqueIds = Object.values(assignedDatabasesMap()).map((db) => {
      return { id: db.id };
    });

    return {
      '+or': uniqueIds,
    };
  };

  const {
    data: databases,
    error: databasesError,
    isLoading,
  } = useDatabasesQuery(
    {
      page_size: pageSize,
      page,
    },
    makeDatabaseIDsFilter(),
    true,
    false
  );

  const DatabasesTable = ({ children }: { children: React.ReactNode }) => (
    <>
      <Table aria-label="Databases" size="small" striped={false}>
        <TableHead
          style={{
            color: theme.tokens.color.Neutrals.White,
          }}
        >
          {SubnetDatabasesTableRowHead}
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
      <PaginationFooter
        count={databases?.results ?? 0}
        handlePageChange={(page: number) => setPage(page)}
        handleSizeChange={(pageSize: number) => setPageSize(pageSize)}
        page={page}
        pageSize={pageSize}
        sx={{
          border: 'none',
          borderBottom: `1px solid ${theme.tokens.component.Table.Row.Border}`,
          borderTop: `1px solid ${theme.tokens.component.Table.Row.Border}`,
        }}
      />
    </>
  );

  const LoadingState = () => (
    <TableRow>
      <TableCell colSpan={6} style={{ textAlign: 'center' }}>
        <CircleProgress size="sm" />
      </TableCell>
    </TableRow>
  );

  const TableErrorState = () => (
    <TableRowError
      colSpan={6}
      message={
        getAPIErrorOrDefault(
          databasesError ?? [],
          'There was a problem retrieving your databases. Refresh the page or try again later.'
        )[0].reason
      }
    />
  );

  const EmptyState = () => (
    <TableRowEmpty colSpan={8} message="No Database Clusters" />
  );

  if (isLoading) {
    return (
      <DatabasesTable>
        <LoadingState />
      </DatabasesTable>
    );
  }

  if (databasesError) {
    // TODO: Fix the error state styling
    return (
      <DatabasesTable>
        <TableErrorState />
      </DatabasesTable>
    );
  }

  if (databases && databases.data.length === 0) {
    return (
      <DatabasesTable>
        <EmptyState />
      </DatabasesTable>
    );
  }

  const databaseRows = () =>
    databases?.data.map((database) => (
      <SubnetDatabaseRow
        assignedDatabase={assignedDatabasesMap()[database.id]}
        database={database}
        key={database.id}
      />
    ));

  return <DatabasesTable>{databaseRows()}</DatabasesTable>;
};
