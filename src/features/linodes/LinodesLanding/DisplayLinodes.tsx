import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import TableWrapper from './TableWrapper';

interface Props {
  openConfigDrawer: (
    c: Linode.Config[],
    action: LinodeConfigSelectionDrawerCallback
  ) => void;
  toggleConfirmation: (
    bootOption: Linode.BootAction,
    linodeId: number,
    linodeLabel: string
  ) => void;
  display: 'grid' | 'list';
  component: any;
  data: Linode.Linode[];
}

type CombinedProps = Props & OrderByProps;

const DisplayLinodes: React.StatelessComponent<CombinedProps> = props => {
  const {
    data,
    display,
    component: Component,
    order,
    orderBy,
    handleOrderChange,
    ...rest
  } = props;

  return (
    <Paginate data={data}>
      {({
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => {
        const componentProps = {
          ...rest,
          data: paginatedData,
          pageSize,
          page,
          handlePageSizeChange,
          handlePageChange
        };
        const tableWrapperProps = {
          handleOrderChange,
          order,
          orderBy
        };
        return (
          <React.Fragment>
            {display === 'list' && (
              <TableWrapper {...tableWrapperProps}>
                <TableBody>
                  <Component showHead {...componentProps} />
                </TableBody>
              </TableWrapper>
            )}
            {display === 'grid' && <Component showHead {...componentProps} />}
            <Grid item xs={12}>
              {
                <PaginationFooter
                  count={data.length}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  pageSize={pageSize}
                  page={page}
                  eventCategory={'linodes landing'}
                />
              }
            </Grid>
          </React.Fragment>
        );
      }}
    </Paginate>
  );
};

export default DisplayLinodes;
