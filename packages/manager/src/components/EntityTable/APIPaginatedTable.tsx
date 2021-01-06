import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import { PaginationProps } from 'src/hooks/usePagination';
import OrderBy from 'src/components/OrderBy';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableContentWrapper from 'src/components/TableContentWrapper';
import EntityTableHeader from './EntityTableHeader';
import { Entity, ListProps } from './types';

interface Props {
  // Since this component is working with API paginated data it doesn't know
  // what the total number of entities is; we pass this from above.
  count: number;
}

export type CombinedProps = Props & ListProps & PaginationProps<Entity>;

export const APIPaginatedTable: React.FC<CombinedProps> = props => {
  const {
    count,
    data,
    error,
    loading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    entity,
    handlers,
    headers,
    initialOrder,
    RowComponent
  } = props;

  return (
    <OrderBy
      data={data}
      orderBy={initialOrder?.orderBy}
      order={initialOrder?.order}
    >
      {({ data: orderedData, order, orderBy, handleOrderChange }) => {
        const _handleOrderChange = (order: any, orderBy: any) => {
          // If we're changing the sort we should go back to page 1
          if (page !== 1) {
            handlePageChange(1);
          }
          // Call the OrderBy built-in change handler
          handleOrderChange(orderBy, order);
        };
        return (
          <>
            <Paper>
              <Table aria-label={`List of ${entity}`}>
                <EntityTableHeader
                  headers={headers}
                  order={order}
                  orderBy={orderBy ?? 'asc'}
                  handleOrderChange={_handleOrderChange}
                />
                <TableBody>
                  <TableContentWrapper
                    length={data.length}
                    loading={loading}
                    error={error}
                    lastUpdated={100}
                  >
                    {orderedData.map(thisEntity => (
                      <RowComponent
                        key={thisEntity.id}
                        {...thisEntity}
                        {...handlers}
                      />
                    ))}
                  </TableContentWrapper>
                </TableBody>
              </Table>
            </Paper>
            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              eventCategory={`${entity} landing table`}
            />
          </>
        );
      }}
    </OrderBy>
  );
};

export default APIPaginatedTable;
