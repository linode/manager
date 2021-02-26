import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableContentWrapper from 'src/components/TableContentWrapper';
import EntityTableHeader from './EntityTableHeader';
import { Entity, ListProps, PageyIntegrationProps } from './types';

export type CombinedProps = ListProps &
  PaginationProps<Entity> &
  PageyIntegrationProps;

export const APIPaginatedTable: React.FC<CombinedProps> = props => {
  const {
    count,
    data,
    error,
    loading,
    page,
    pageSize,
    request,
    handleOrderChange,
    handlePageChange,
    handlePageSizeChange,
    entity,
    handlers,
    headers,
    initialOrder,
    RowComponent,
  } = props;

  const _data = data ?? [];

  const normalizedData = props.normalizeData
    ? props.normalizeData(_data)
    : _data;

  React.useEffect(() => {
    if (initialOrder) {
      handleOrderChange(initialOrder.orderBy, initialOrder.order);
    } else {
      request();
    }
  }, [request, handleOrderChange, initialOrder]);

  return (
    <>
      <Paper>
        <Table aria-label={`List of ${entity}`}>
          <EntityTableHeader
            headers={headers}
            order={props.order}
            orderBy={props.orderBy ?? 'asc'}
            handleOrderChange={props.handleOrderChange}
          />
          <TableBody>
            <TableContentWrapper
              length={count}
              loading={loading}
              error={error}
              lastUpdated={100}
            >
              {normalizedData.map(thisEntity => (
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
};

const enhanced = compose<CombinedProps, any>(
  Pagey((ownProps, params, filters) => ownProps.request(params, filters), {
    cb: (ownProps, response) => {
      if (ownProps.persistData) {
        ownProps.persistData(response.data);
      }
    },
  })
);

export default enhanced(APIPaginatedTable);
