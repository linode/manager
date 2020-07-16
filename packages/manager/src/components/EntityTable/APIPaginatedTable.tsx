import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableContentWrapper from 'src/components/TableContentWrapper';
import { Entity, ListProps } from './types';

export type CombinedProps = ListProps & PaginationProps<Entity>;

export const APIPaginatedTable: React.FC<CombinedProps> = props => {
  const {
    count,
    data,
    page,
    pageSize,
    request,
    handlePageChange,
    handlePageSizeChange,
    entity,
    handlers,
    headerCells,
    RowComponent
  } = props;

  React.useEffect(() => {
    request();
  }, [request]);

  return (
    <>
      <Paper>
        <Table aria-label={`List of ${entity}`}>
          <TableHead>
            <TableRow>{headerCells}</TableRow>
          </TableHead>
          <TableBody>
            <TableContentWrapper
              length={count}
              loading={false}
              error={undefined}
              lastUpdated={100}
            >
              {data.map(thisEntity => (
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
  Pagey((ownProps, params, filters) => ownProps.request(params, filters))
);

export default enhanced(APIPaginatedTable);
