import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableContentWrapper from 'src/components/TableContentWrapper';
import { ListProps } from './types';

export type CombinedProps = ListProps;

export const ListEntities: React.FC<CombinedProps> = props => {
  const {
    data,
    entity,
    error,
    handlers,
    headerCells,
    loading,
    lastUpdated,
    RowComponent
  } = props;
  return (
    <Paginate data={data}>
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
              <TableHead>
                <TableRow>{headerCells}</TableRow>
              </TableHead>
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
  );
};

export default ListEntities;
