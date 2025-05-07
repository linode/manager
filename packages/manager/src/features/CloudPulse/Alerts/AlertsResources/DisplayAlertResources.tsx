import { Box, Checkbox, Tooltip } from '@linode/ui';
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

import { isAllPageSelected, isSomeSelected } from '../Utils/AlertResourceUtils';
import { AlertMaxSelectionText } from '../Utils/AlertMaxSelectionText';
import { serviceTypeBasedColumns } from './constants';

import type { AlertServiceType } from '@linode/api-v4';
import type { Order } from '@linode/utilities';

export interface AlertInstance {
  /**
   * Indicates if the instance is selected or not
   */
  checked?: boolean;
  /**
   * The region associated with the instance
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

  /**
   * The list of tags associated with the instance
   */
  tags?: string[];
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
   * The maximum number of elements that can be selected
   */
  maxSelectionCount?: number;

  /**
   * Callback to scroll till the element required on page change change or sorting change
   */
  scrollToElement: () => void;

  /**
   * The number of elements that can be selected based on selected resources and maximum selections
   */
  selectionsRemaining?: number;

  /**
   * The service type associated with the alert
   */
  serviceType?: AlertServiceType;
}

export const DisplayAlertResources = React.memo(
  (props: DisplayAlertResourceProp) => {
    const {
      filteredResources,
      handleSelection,
      isDataLoadingError,
      isSelectionsNeeded,
      maxSelectionCount,
      scrollToElement,
      selectionsRemaining,
      serviceType,
    } = props;
    const pageSize = 25;

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

    const isCheckboxDisabled = (
      isChecked?: boolean,
      uncheckedCount?: number
    ) => {
      if (selectionsRemaining === undefined) {
        return false;
      }

      if (uncheckedCount === undefined) {
        // if uncheckedCount is not passed, just rely on isChecked and selectionsRemaining
        return !isChecked && selectionsRemaining === 0;
      }

      return selectionsRemaining < uncheckedCount; // find if there is appropriate space for root checkbox to be enabled
    };
    const columns = serviceTypeBasedColumns[serviceType ?? ''];
    const colSpanCount = isSelectionsNeeded
      ? columns.length + 1
      : columns.length;
    return (
      <Paginate data={sortedData ?? []} pageSize={pageSize}>
        {({
          count,
          data: paginatedData,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        }) => {
          const isRootCheckBoxDisabled = isCheckboxDisabled(
            false,
            paginatedData.filter(({ checked }) => !checked).length
          );
          return (
            <>
              <Table data-qa-alert-table data-testid="alert_resources_region">
                <TableHead>
                  <TableRow>
                    {isSelectionsNeeded && (
                      <TableCell
                        padding="checkbox"
                        sx={{
                          cursor: isRootCheckBoxDisabled
                            ? 'not-allowed'
                            : 'auto',
                        }}
                      >
                        <Tooltip
                          placement="right-start"
                          slotProps={{
                            tooltip: {
                              sx: {
                                maxWidth: '250px',
                              },
                            },
                          }}
                          title={
                            maxSelectionCount !== undefined &&
                            isRootCheckBoxDisabled ? (
                              <AlertMaxSelectionText
                                maxSelectionCount={maxSelectionCount}
                              />
                            ) : undefined
                          }
                        >
                          <Box>
                            <Checkbox
                              checked={isAllPageSelected(paginatedData)}
                              data-testid={`select_all_in_page_${page}`}
                              disabled={isRootCheckBoxDisabled}
                              indeterminate={
                                isSomeSelected(paginatedData) &&
                                !isAllPageSelected(paginatedData)
                              }
                              onClick={() =>
                                handleSelectionChange(
                                  paginatedData.map(({ id }) => id),
                                  !isAllPageSelected(paginatedData)
                                )
                              }
                              size="small"
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                    )}
                    {columns.map(({ label, sortingKey }) => (
                      <TableSortCell
                        active={sorting.orderBy === sortingKey}
                        data-qa-header={label.toLowerCase()}
                        data-testid={label.toLowerCase()}
                        direction={sorting.order}
                        handleClick={(orderBy, order) =>
                          handleSort(orderBy, order, handlePageChange)
                        }
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
                    paginatedData.map((resource, index) => {
                      const { checked, id } = resource;
                      const isItemCheckboxDisabled =
                        isCheckboxDisabled(checked);
                      return (
                        <TableRow data-qa-alert-row={id} key={`${index}_${id}`}>
                          {isSelectionsNeeded && (
                            <TableCell
                              sx={{
                                cursor: isItemCheckboxDisabled
                                  ? 'not-allowed'
                                  : 'auto',
                              }}
                            >
                              <Tooltip
                                placement="right-start"
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      maxWidth: '250px',
                                    },
                                  },
                                }}
                                title={
                                  isItemCheckboxDisabled &&
                                  maxSelectionCount !== undefined ? (
                                    <AlertMaxSelectionText
                                      maxSelectionCount={maxSelectionCount}
                                    />
                                  ) : undefined
                                }
                              >
                                <Box>
                                  <Checkbox
                                    checked={checked}
                                    data-testid={`select_item_${id}`}
                                    disabled={isItemCheckboxDisabled}
                                    onClick={() => {
                                      handleSelectionChange([id], !checked);
                                    }}
                                    size="small"
                                  />
                                </Box>
                              </Tooltip>
                            </TableCell>
                          )}
                          {columns.map(({ accessor, label }) => (
                            <TableCell
                              data-qa-alert-cell={`${id}_${label.toLowerCase()}`}
                              key={label}
                            >
                              {accessor(resource)}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  {isDataLoadingError && (
                    <TableRowError
                      colSpan={colSpanCount}
                      message="Table data is unavailable. Please try again later."
                    />
                  )}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={colSpanCount}
                        height="40px"
                      >
                        No data to display.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {!isDataLoadingError && paginatedData.length !== 0 && (
                <PaginationFooter
                  count={count}
                  eventCategory="alerts_resources"
                  handlePageChange={(page) => {
                    handlePageNumberChange(handlePageChange, page);
                  }}
                  handleSizeChange={(pageSize) => {
                    handlePageSizeChange(pageSize);
                    handlePageNumberChange(handlePageChange, 1); // Moves to the first page after page size change
                    scrollToGivenElement();
                  }}
                  page={page}
                  pageSize={pageSize}
                />
              )}
            </>
          );
        }}
      </Paginate>
    );
  }
);
