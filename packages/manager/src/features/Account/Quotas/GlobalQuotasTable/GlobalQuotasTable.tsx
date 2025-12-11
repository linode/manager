import React from 'react';

import { Table } from 'src/components/Table/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { useGetObjGlobalQuotasWithUsage } from '../hooks/useGetObjGlobalQuotasWithUsage';
import { GlobalQuotasTableRow } from './GlobalQuotasTableRow';

const quotaRowMinHeight = 58;

export const GlobalQuotasTable = () => {
  const {
    data: globalQuotasWithUsage,
    isFetching: isFetchingGlobalQuotas,
    isError: globalQuotasError,
  } = useGetObjGlobalQuotasWithUsage();

  return (
    <Table
      data-testid="table-endpoint-quotas"
      sx={(theme) => ({
        marginTop: theme.spacingFunction(16),
        minWidth: theme.breakpoints.values.sm,
      })}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '25%' }}>Quota Name</TableCell>
          <TableCell sx={{ width: '30%' }}>Account Quota Value</TableCell>
          <TableCell sx={{ width: '35%' }}>Usage</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {isFetchingGlobalQuotas ? (
          <TableRowLoading columns={3} sx={{ height: quotaRowMinHeight }} />
        ) : globalQuotasError ? (
          <TableRowError
            colSpan={3}
            message="There was an error retrieving global object storage quotas."
          />
        ) : globalQuotasWithUsage.length === 0 ? (
          <TableRowEmpty
            colSpan={3}
            message="There is no data available for this service."
            sx={{ height: quotaRowMinHeight }}
          />
        ) : (
          globalQuotasWithUsage.map((globalQuota, index) => {
            return (
              <GlobalQuotasTableRow globalQuota={globalQuota} key={index} />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
