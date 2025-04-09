import React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { StyledTableCell } from './DomainRecords.styles';

import type { IType } from './generateTypes';
import type { Domain, DomainRecord } from '@linode/api-v4/lib/domains';

interface DomainRecordTableProps {
  count: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  paginatedData: Domain[] | DomainRecord[];
  type: IType;
}

export const DomainRecordTable = (props: DomainRecordTableProps) => {
  const {
    count,
    handlePageChange,
    handlePageSizeChange,
    page,
    pageSize,
    paginatedData,
    type,
  } = props;

  return (
    <>
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
                <TableRow
                  data-qa-record-row={type.title}
                  key={`domain-record-${idx}`}
                >
                  {type.columns.length > 0 &&
                    type.columns.map(({ render, title }, columnIndex) => {
                      return (
                        <StyledTableCell
                          data-qa-column={title}
                          key={columnIndex}
                        >
                          {title === 'Email' || title === 'IP Address' ? (
                            <MaskableText
                              length={
                                title === 'IP Address' ? 'ipv6' : undefined
                              }
                              isToggleable
                              text={data.toString()}
                            >
                              <>{render(data)}</>
                            </MaskableText>
                          ) : (
                            render(data)
                          )}
                        </StyledTableCell>
                      );
                    })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <PaginationFooter
        count={count}
        eventCategory={`${type.title.toLowerCase()} panel`}
        handlePageChange={handlePageChange}
        handleSizeChange={handlePageSizeChange}
        page={page}
        pageSize={pageSize}
        // Disabling show All as it is impacting page performance.
        showAll={false}
      />
    </>
  );
};
