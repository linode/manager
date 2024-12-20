import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { StyledTableCell } from './DomainRecords.styles';

import type { IType } from './DomainRecords';
import type { DomainRecord } from '@linode/api-v4';

interface DomainRecordTableProps {
  paginatedData: DomainRecord[];
  type: IType;
}

export const DomainRecordTable = (props: DomainRecordTableProps) => {
  const { paginatedData, type } = props;

  return (
    <Table aria-label={`List of Domains ${type.title}`}>
      <TableHead>
        <TableRow>
          {type.columns.length > 0 &&
            type.columns.map((col, columnIndex) => {
              return <TableCell key={columnIndex}>{col.title}</TableCell>;
            })}
        </TableRow>
      </TableHead>
      <TableBody>
        {type.data.length === 0 ? (
          <TableRowEmpty colSpan={type.columns.length} />
        ) : (
          paginatedData.map((data, idx) => {
            return (
              <TableRow data-qa-record-row={type.title} key={idx}>
                {type.columns.length > 0 &&
                  type.columns.map(({ render, title }, columnIndex) => {
                    return (
                      <StyledTableCell
                        data-qa-column={title}
                        key={columnIndex}
                        parentColumn={title}
                      >
                        {render(data)}
                      </StyledTableCell>
                    );
                  })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
