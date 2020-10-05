import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableContentWrapper from 'src/components/TableContentWrapper';
import EntityTableHeader from './EntityTableHeader';
import { ListProps } from './types';

export type CombinedProps = ListProps;

export const ListEntities: React.FC<CombinedProps> = props => {
  const {
    data,
    entity,
    error,
    handlers,
    headers,
    initialOrder,
    loading,
    lastUpdated,
    RowComponent,
    readOnly
  } = props;
  return (
    <OrderBy
      data={data}
      orderBy={initialOrder?.orderBy}
      order={initialOrder?.order}
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            data: paginatedAndOrderedData,
            count,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize
          }) => (
            <>
              <Paper>
                <Table aria-label={`List of ${entity}`}>
                  <EntityTableHeader
                    headers={headers}
                    handleOrderChange={handleOrderChange}
                    order={order}
                    orderBy={orderBy}
                  />

                  <TableBody>
                    <TableContentWrapper
                      length={paginatedAndOrderedData.length}
                      loading={loading}
                      error={error}
                      lastUpdated={lastUpdated}
                    >
                      {paginatedAndOrderedData.map(thisEntity => (
                        <RowComponent
                          key={thisEntity.id}
                          readOnly={readOnly}
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
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                eventCategory="Firewall Devices Table"
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
};

export default ListEntities;
