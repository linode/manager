import * as React from 'react';
import { compose } from 'recompose';
import { Props as LVProps } from 'src/containers/longview.container';

import Box from 'src/components/core/Box';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';

import { ActionHandlers } from './LongviewActionMenu';
import LongviewRows from './LongviewListRows';

type LongviewProps = Omit<
  LVProps,
  | 'getLongviewClients'
  | 'createLongviewClient'
  | 'deleteLongviewClient'
  | 'updateLongviewClient'
>;

type CombinedProps = LongviewProps & ActionHandlers;

const LongviewList: React.FC<CombinedProps> = props => {
  const {
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    ...actionMenuHandlers
  } = props;

  return (
    <React.Fragment>
      <OrderBy
        data={Object.values(longviewClientsData)}
        orderBy={'label'}
        order={'asc'}
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
                <Box flexDirection="column">
                  <LongviewRows
                    longviewClientsData={paginatedAndOrderedData}
                    longviewClientsError={longviewClientsError}
                    longviewClientsLastUpdated={longviewClientsLastUpdated}
                    longviewClientsLoading={longviewClientsLoading}
                    longviewClientsResults={longviewClientsResults}
                    {...actionMenuHandlers}
                  />
                </Box>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="Longview Table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
    </React.Fragment>
  );
};

export default compose<CombinedProps, LongviewProps & ActionHandlers>(
  React.memo
)(LongviewList);
