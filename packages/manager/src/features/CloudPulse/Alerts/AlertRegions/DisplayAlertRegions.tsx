import { Box, Checkbox } from '@linode/ui';
import { TableBody, TableHead } from '@mui/material';
import React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import type { SelectDeselectAll } from '../constants';

export interface AlertRegion {
  checked: boolean;
  count: number;
  id: string;
  label: string;
}

interface DisplayAlertRegionProps {
  handleSelectAll: (action: SelectDeselectAll) => void;
  handleSelectionChange: (regionId: string, isChecked: boolean) => void;

  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  regions?: AlertRegion[];
  showSelected?: boolean;
  viewOnly?: boolean;
}

export const DisplayAlertRegions = React.memo(
  (props: DisplayAlertRegionProps) => {
    const {
      regions,
      handleSelectionChange,
      isSomeSelected,
      isAllSelected,
      showSelected,
      handleSelectAll,
      viewOnly,
    } = props;

    return (
      <Paginate data={regions ?? []}>
        {({
          count,
          page,
          pageSize,
          handlePageChange,
          handlePageSizeChange,
          data: paginatedData,
        }) => (
          <Box>
            <Table
              colCount={2}
              data-qa="region-tabls"
              data-testid="region-table"
              size="small"
            >
              <TableHead>
                <TableRow>
                  {!viewOnly && (
                    <TableCell>
                      <Box>
                        <Checkbox
                          checked={!isSomeSelected && isAllSelected}
                          data-testid="select-all-checkbox"
                          indeterminate={isSomeSelected && !isAllSelected}
                          onChange={(_, checked) =>
                            handleSelectAll(
                              checked ? 'Select All' : 'Deselect All'
                            )
                          }
                        />
                      </Box>
                    </TableCell>
                  )}
                  <TableSortCell
                    active={true}
                    data-qa-header="Region"
                    data-qa-sorting="Region"
                    direction="asc"
                    handleClick={() => {}}
                    label="Region"
                  >
                    Region
                  </TableSortCell>
                  <TableSortCell
                    active={true}
                    data-qa-header="associated-entities"
                    data-qa-sorting="associated-header"
                    direction="asc"
                    handleClick={() => {}}
                    label="Associated Entities"
                  >
                    Associated Entities
                  </TableSortCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableContentWrapper
                  length={regions?.length ?? 0}
                  loading={false}
                >
                  {paginatedData
                    ?.filter(({ checked }) => (showSelected ? checked : true))
                    .map(({ label, id, checked, count }) => {
                      return (
                        <TableRow data-testid={`region-row-${id}`} key={id}>
                          {!viewOnly && (
                            <TableCell>
                              <Checkbox
                                checked={checked}
                                onChange={(_, status) =>
                                  handleSelectionChange(id, status)
                                }
                              />
                            </TableCell>
                          )}

                          <TableCell>
                            {label} ({id})
                          </TableCell>
                          <TableCell>{count}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableContentWrapper>
              </TableBody>
            </Table>
            <PaginationFooter
              count={count}
              eventCategory="Regions Table"
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
            />
          </Box>
        )}
      </Paginate>
    );
  }
);
