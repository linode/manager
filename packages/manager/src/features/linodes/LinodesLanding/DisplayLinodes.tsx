import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import useFlags from 'src/hooks/useFlags';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { ExtendedLinode } from '../LinodesDetail/types';
import TableWrapper from './TableWrapper';
import TableWrapper_CMR from './TableWrapper_CMR';
interface Props {
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  display: 'grid' | 'list';
  component: any;
  data: ExtendedLinode[];
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

  const numberOfLinodesWithMaintenance = data.reduce((acc, thisLinode) => {
    if (thisLinode.maintenance) {
      acc++;
    }
    return acc;
  }, 0);

  return (
    <Paginate
      data={data}
      // If there are more Linodes with maintenance than the current page size, show the minimum
      // page size needed to show ALL Linodes with maintenance.
      pageSize={
        numberOfLinodesWithMaintenance > infinitePageSize
          ? getMinimumPageSizeForNumberOfItems(numberOfLinodesWithMaintenance)
          : infinitePageSize
      }
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
