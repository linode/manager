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

import type { AlertFormMode } from '../constants';
import type { Region } from '@linode/api-v4';

interface DisplayAlertRegionProps {
  /**
   * Function to handle the change in selection of a region.
   */
  handleSelectionChange: (regionId: string, isChecked: boolean) => void;

  /**
   * Flag to indicate the mode of the form
   */
  mode?: AlertFormMode;
  /**
   * List of regions to be displayed.
   */
  regions?: Region[];
  /**
   * To indicate whether to show only selected regions or not.
   */
  showSelected?: boolean;
}

export const DisplayAlertRegions = React.memo(
  (props: DisplayAlertRegionProps) => {
    const {
      regions,
      handleSelectionChange,

      mode,
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
                  {mode !== 'view' && (
                    <TableCell>
                      <Box>
                        <Checkbox
                          data-testid="select-all-checkbox"
                          onChange={(_, _checked) => {}}
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
                </TableRow>
              </TableHead>
              <TableBody>
                <TableContentWrapper
                  length={regions?.length ?? 0}
                  loading={false}
                >
                  {paginatedData.map(({ label, id }) => {
                    return (
                      <TableRow data-testid={`region-row-${id}`} key={id}>
                        {mode !== 'view' && (
                          <TableCell>
                            <Checkbox
                              onChange={(_, status) =>
                                handleSelectionChange(id, status)
                              }
                            />
                          </TableCell>
                        )}

                        <TableCell>
                          {label} ({id})
                        </TableCell>
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
