import { Config, Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import useFlags from 'src/hooks/useFlags';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import TableWrapper from './TableWrapper';
import TableWrapper_CMR from './TableWrapper_CMR';

interface Props {
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  display: 'grid' | 'list';
  component: any;
  data: Linode[];
  someLinodesHaveMaintenance: boolean;
}

type CombinedProps = Props & OrderByProps;

const DisplayLinodes: React.FC<CombinedProps> = props => {
  const {
    data,
    display,
    component: Component,
    order,
    orderBy,
    handleOrderChange,
    ...rest
  } = props;

  const flags = useFlags();

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  return (
    <Paginate
      data={data}
      pageSize={infinitePageSize}
      pageSizeSetter={setInfinitePageSize}
    >
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
          someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
          dataLength: paginatedData.length
        };
        return (
          <React.Fragment>
            {display === 'list' &&
              (flags.cmr ? (
                <TableWrapper_CMR {...tableWrapperProps}>
                  <TableBody>
                    <Component showHead {...componentProps} />
                  </TableBody>
                </TableWrapper_CMR>
              ) : (
                <TableWrapper {...tableWrapperProps}>
                  <TableBody>
                    <Component showHead {...componentProps} />
                  </TableBody>
                </TableWrapper>
              ))}
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
                  showAll
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
