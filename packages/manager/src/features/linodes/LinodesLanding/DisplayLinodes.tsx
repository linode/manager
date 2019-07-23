import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import TableWrapper from './TableWrapper';

import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';

interface Props {
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Linode.Config[]
  ) => void;
  display: 'grid' | 'list';
  component: any;
  data: Linode.Linode[];
  someLinodesHaveMaintenance: boolean;
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
          orderBy,
          someLinodesHaveMaintenance: props.someLinodesHaveMaintenance
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
