import { Checkbox } from '@linode/ui';
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

import { serviceTypeBasedColumns } from './constants';

import type { Order } from 'src/hooks/useOrder';

export interface AlertInstance {
  /**
   * Indicates if the instance is selected or not
   */
  checked?: boolean;
  /**
   * The engine associated with the instance in case of databases
   */
  engineType?: string;
  /**
   * The id of the instance
   */
  id: string;

  /**
   * The label of the instance
   */
  label: string;

  /**
   * The region associated with the instance
   */
  region: string;
}

export interface DisplayAlertResourceProp {
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
   * The size of the page needed in the table
   */
  pageSize: number;
  /**
   * Callback to scroll till the element required on page change change or sorting change
   */
  scrollToElement: () => void;

  /**
   * The service type associated with the alert
   */
  serviceType?: string;
}

export const DisplayAlertResources = React.memo(
  (props: DisplayAlertResourceProp) => {
    const {
      filteredResources,
      handleSelection,
      isDataLoadingError,
      isSelectionsNeeded,
      pageSize,
      scrollToElement,
      serviceType,
    } = props;

    const [sorting, setSorting] = React.useState<{
      order: Order;
      orderBy: string;
    }>({
      order: 'asc',
      orderBy: 'label', // default order to be asc and orderBy will be label
    });
    // Holds the sorted data based on the selected sort order and column
    const sortedData = React.useMemo(() => {
      return sortData<AlertInstance>(
        sorting.orderBy,
        sorting.order
      )(filteredResources ?? []);
    }, [filteredResources, sorting]);

    const scrollToGivenElement = React.useCallback(() => {
      requestAnimationFrame(() => {
        scrollToElement();
      });
    }, [scrollToElement]);

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
        handlePageChange(1); // Moves to the first page when the sort order or column changes
        scrollToGivenElement();
      },
      [scrollToGivenElement]
    );

    const handlePageNumberChange = React.useCallback(
      (handlePageChange: (page: number) => void, pageNumber: number) => {
        handlePageChange(pageNumber); // Moves to the requested page number
        scrollToGivenElement();
      },
      [scrollToGivenElement]
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

    const columns = serviceTypeBasedColumns[serviceType ?? 'linode'] ?? [];

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
          <>
            <Table data-qa-alert-table data-testid="alert_resources_region">
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
                  {columns.map(({ label, sortingKey }) => (
                    <TableSortCell
                      handleClick={(orderBy, order) =>
                        handleSort(orderBy, order, handlePageChange)
                      }
                      active={sorting.orderBy === sortingKey}
                      data-testid={label.toLowerCase()}
                      direction={sorting.order}
                      key={label}
                      label={sortingKey ?? ''}
                    >
                      {label}
                    </TableSortCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody
                data-qa-alert-table-body
                data-testid="alert_resources_content"
              >
                {!isDataLoadingError &&
                  paginatedData.map((resource, index) => (
                    <TableRow
                      data-qa-alert-row={resource.id}
                      key={`${index}_${resource.id}`}
                    >
                      {isSelectionsNeeded && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            onClick={() => {
                              handleSelectionChange(
                                [resource.id],
                                !resource.checked
                              );
                            }}
                            sx={{
                              padding: 0,
                            }}
                            checked={resource.checked}
                            data-testid={`select_item_${resource.id}`}
                          />
                        </TableCell>
                      )}
                      {columns.map(({ accessor, label }) => (
                        <TableCell
                          data-qa-alert-cell={`${resource.id}_${label}`}
                          key={label}
                        >
                          {accessor(resource)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {isDataLoadingError && (
                  <TableRowError
                    colSpan={3}
                    message="Table data is unavailable. Please try again later."
                  />
                )}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell align="center" colSpan={3} height="40px">
                      No data to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {!isDataLoadingError && paginatedData.length !== 0 && (
              <PaginationFooter
                handlePageChange={(page) => {
                  handlePageNumberChange(handlePageChange, page);
                }}
                handleSizeChange={(pageSize) => {
                  handlePageSizeChange(pageSize);
                  handlePageNumberChange(handlePageChange, 1); // Moves to the first page after page size change
                  scrollToGivenElement();
                }}
                count={count}
                eventCategory="alerts_resources"
                page={page}
                pageSize={pageSize}
              />
            )}
          </>
        )}
      </Paginate>
    );
  }
);
