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

  const assignedDatabasesMap: Record<number, SubnetAssignedDatabaseData> = {}; // Store assigned databases in map for easy lookup when rendering subnet database rows
  const databaseIDsToFilter = databasesData.map((database) => {
    assignedDatabasesMap[database.id] = database;
    return {
      id: database.id,
    };
  });

  const {
    data: databases,
    error: databasesError,
    isLoading,
  } = useDatabasesQuery(
    {
      page_size: pageSize,
      page,
    },
    {
      '+or': databaseIDsToFilter,
    },
    true
  );

  const DatabasesTableWrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
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
  );

  if (isLoading) {
    return (
      <DatabasesTableWrapper>
        <TableRow>
          <TableCell colSpan={4} style={{ textAlign: 'center' }}>
            <CircleProgress size="sm" />
          </TableCell>
        </TableRow>
      </DatabasesTableWrapper>
    );
  }

  if (databasesError) {
    return (
      <DatabasesTableWrapper>
        <TableRowError
          colSpan={4}
          message={
            getAPIErrorOrDefault(
              databasesError ?? [],
              'There was a problem retrieving your databases. Refresh the page or try again later.'
            )[0].reason
          }
        />
      </DatabasesTableWrapper>
    );
  }

  if (databases && databases.data.length === 0) {
    return (
      <DatabasesTableWrapper>
        <TableRowEmpty colSpan={4} message="No Database Clusters" />
      </DatabasesTableWrapper>
    );
  }

  return (
    <>
      <DatabasesTableWrapper>
        {databases?.data.map((database) => (
          <SubnetDatabaseRow
            assignedDatabase={assignedDatabasesMap[database.id]}
            database={database}
            key={database.id}
          />
        ))}
      </DatabasesTableWrapper>
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
};
