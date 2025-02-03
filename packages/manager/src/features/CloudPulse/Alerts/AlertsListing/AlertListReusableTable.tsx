import { Box } from '@linode/ui';
import { Grid, TableBody, TableHead } from '@mui/material';
import React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import { AlertListReusableTableRow } from './AlertListReusableTableRow';

import type { Alert } from '@linode/api-v4';

export interface AlertListReusableTableProps {
  alerts: Alert[];
  columns: TableColumnHeader[];
  entityId: string;
  entityName: string;
  ordeByColumn: string;
}

export interface TableColumnHeader {
  columnName: string;
  label: string;
}

export const AlertListReusableTable = (props: AlertListReusableTableProps) => {
  const { alerts, columns, entityId, entityName, ordeByColumn } = props;

  return (
    <OrderBy data={alerts} order="asc" orderBy={ordeByColumn}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            count,
            data: paginatedAndOrderedAlerts,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <Box>
              <Grid>
                <Table colCount={columns.length + 1} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell actionCell />
                      {columns.map((column) => {
                        return (
                          <TableSortCell
                            active={orderBy === column.label}
                            data-qa-header={column.label}
                            data-qa-sorting={column.label}
                            direction={order}
                            handleClick={handleOrderChange}
                            key={column.label}
                            label={column.label}
                          >
                            {column.columnName}
                          </TableSortCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      length={paginatedAndOrderedAlerts.length}
                      loading={false}
                    />
                    {paginatedAndOrderedAlerts?.map((alert) => (
                      <AlertListReusableTableRow
                        alert={alert}
                        entityId={entityId}
                        entityName={entityName}
                        key={alert.id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Grid>
              <PaginationFooter
                count={count}
                eventCategory="Alert Definitions Table"
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </Box>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
};
