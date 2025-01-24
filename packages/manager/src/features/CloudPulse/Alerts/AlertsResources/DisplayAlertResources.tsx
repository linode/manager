import { Checkbox } from '@linode/ui';
import { TableBody, TableHead, useTheme } from '@mui/material';
import React from 'react';

import { sortData } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';

import type { Order } from 'src/hooks/useOrder';

export interface AlertInstance {
  /**
   * Indicates if the instance is selected or not
   */
  checked?: boolean;
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
   * When passed, this error text will be displayed in the table
   */
  errorText: string;

  /**
   * The resources that needs to be displayed
   */
  filteredResources: AlertInstance[] | undefined;

  /**
   * Callback for clicking on check box
   */
  handleSelection?: (id: string[], isSelectAction: boolean) => void;

  /**
   * Indicates, there is an error in loading the data, if it is passed true, error message will be displayed
   */
  isDataLoadingError: boolean;

  /**
   * This controls whether to show the selection check box or not
   */
  isSelectionsNeeded?: boolean;

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
      errorText,
      filteredResources,
      handleSelection,
      isDataLoadingError,
      isSelectionsNeeded,
      noDataText,
      pageSize,
      scrollToTitle,
    } = props;

    const [sorting, setSorting] = React.useState<{
      order: Order;
      orderBy: string;
    }>({
      order: 'asc',
      orderBy: 'label', // default order to be asc and orderBy will be label
    });

    const theme = useTheme();

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

    const handleSelectionChange = React.useCallback(
      (id: string[], isSelectionAction: boolean) => {
        if (handleSelection) {
          handleSelection(id, isSelectionAction);
        }
      },
      [handleSelection]
    );

    const isAllPageSelected = (paginatedData: AlertInstance[]): boolean => {
      return (
        Boolean(paginatedData?.length) &&
        paginatedData.every((resource) => resource.checked)
      );
    };

    const isSomeSelected = (paginatedData: AlertInstance[]): boolean => {
      return (
        Boolean(paginatedData?.length) &&
        paginatedData.some((resource) => resource.checked)
      );
    };

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
            <Table data-qa-alert-table>
              <TableHead>
                <TableRow>
                  {isSelectionsNeeded && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          isSomeSelected(paginatedData) &&
                          !isAllPageSelected(paginatedData)
                        }
                        onClick={() =>
                          handleSelectionChange(
                            paginatedData.map((resource) => resource.id),
                            !isAllPageSelected(paginatedData)
                          )
                        }
                        sx={{
                          padding: 0,
                        }}
                        checked={isAllPageSelected(paginatedData)}
                        data-testid={`select_all_in_page_${page}`}
                      />
                    </TableCell>
                  )}
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
              <TableBody data-qa-alert-table-body>
                {!isDataLoadingError &&
                  paginatedData.map(({ checked, id, label, region }) => (
                    <TableRow data-qa-alert-row={id} key={id}>
                      {isSelectionsNeeded && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            onClick={() => {
                              handleSelectionChange([id], !checked);
                            }}
                            sx={{
                              padding: 0,
                            }}
                            checked={checked}
                            data-testid={`select_item_${id}`}
                          />
                        </TableCell>
                      )}
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
                    colSpan={3}
                    message={errorText ?? 'Table data is unavailable.'}
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
