import { useTheme } from '@mui/material';
import React from 'react';

import { sortData } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';

import type { Order } from 'src/hooks/useOrder';

export interface AlertInstance {
  /**
   * The id of the alert
   */
  id: string;
  /**
   * The label of the alert
   */
  label: string;
  /**
   * The region associated with the alert
   */
  region?: string;
}

export interface DisplayAlertResourceProp {
  /**
   * The resources that needs to be displayed
   */
  filteredResources: AlertInstance[] | undefined;

  /**
   * A flag indicating if there was an error loading the data. If true, the error message
   * (specified by `errorText`) will be displayed in the table.
   */
  isDataLoadingError: boolean;

  /**
   * This is passed if there is no resources associated with the alerts
   */
  noDataText?: string;

  /**
   * The size of the page needed in the table
   */
  pageSize: number;

  /**
   * Callback to scroll till to the top of the Resources title section
   */
  scrollToTitle: () => void;
}

export const DisplayAlertResources = React.memo(
  (props: DisplayAlertResourceProp) => {
    const {
      filteredResources,
      isDataLoadingError,
      noDataText,
      pageSize,
      scrollToTitle,
    } = props;
    const theme = useTheme();

    const [sorting, setSorting] = React.useState<{
      order: Order;
      orderBy: string;
    }>({
      order: 'asc',
      orderBy: 'label', // default order to be asc and orderBy will be label
    });
    // The sorted data based on the selection in the table
    const sortedData = React.useMemo(() => {
      return sortData(
        sorting.orderBy,
        sorting.order
      )(filteredResources ?? []) as AlertInstance[];
    }, [filteredResources, sorting]);

    const handleSort = React.useCallback(
      (
        orderBy: string,
        order: Order | undefined,
        handlePageChange: (page: number) => void
      ) => {
        if (!order) {
          return;
        }

        setSorting({
          order,
          orderBy,
        });
        handlePageChange(1); // move to first page on sort change
        scrollToTitle(); // scroll to title
      },
      [scrollToTitle]
    );

    const handlePageNumberChange = React.useCallback(
      (handlePageChange: (page: number) => void, pageNumber: number) => {
        handlePageChange(pageNumber); // move to requested page number
        scrollToTitle(); // scroll to title
      },
      [scrollToTitle]
    );
    return (
      <Paginate data={sortedData ?? []} pageSize={pageSize}>
        {({
          count,
          data: paginatedData,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        }) => (
          <React.Fragment>
            <Table data-qa-alert-table data-testid="alert_resources_region">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    handleClick={(orderBy, order) => {
                      handleSort(orderBy, order, handlePageChange);
                    }}
                    active={sorting.orderBy === 'label'}
                    data-qa-header="resource"
                    data-testid="resource"
                    direction={sorting.order}
                    label="label"
                  >
                    Resource
                  </TableSortCell>
                  <TableSortCell
                    handleClick={(orderBy, order) => {
                      handleSort(orderBy, order, handlePageChange);
                    }}
                    active={sorting.orderBy === 'region'}
                    data-qa-header="region"
                    data-testid="region"
                    direction={sorting.order}
                    label="region"
                  >
                    Region
                  </TableSortCell>
                </TableRow>
              </TableHead>
              <TableBody
                data-qa-alert-table-body
                data-testid="alert_resources_content"
              >
                {!isDataLoadingError &&
                  paginatedData.map(({ id, label, region }) => (
                    <TableRow data-qa-alert-row={id} key={id}>
                      <TableCell data-qa-alert-cell={`${id}_resource`}>
                        {label}
                      </TableCell>
                      <TableCell data-qa-alert-cell={`${id}_region`}>
                        {region}
                      </TableCell>
                    </TableRow>
                  ))}
                {isDataLoadingError && (
                  <TableRowError
                    message={
                      'Table data is unavailable. Please try again later.'
                    }
                    colSpan={3}
                  />
                )}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={3}
                      height={theme.spacing(6)}
                    >
                      {noDataText ?? 'No results found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {!isDataLoadingError && !noDataText && (
              <PaginationFooter
                handlePageChange={(page) => {
                  handlePageNumberChange(handlePageChange, page);
                }}
                handleSizeChange={(pageSize) => {
                  handlePageSizeChange(pageSize);
                  handlePageNumberChange(handlePageChange, 1); // move to first page
                }}
                count={count}
                eventCategory="alerts_resources"
                page={page}
                pageSize={pageSize}
              />
            )}
          </React.Fragment>
        )}
      </Paginate>
    );
  }
);
