import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { OrderByProps } from 'src/components/OrderBy';
import { Table, TableProps } from 'src/components/Table';

import { SortableTableHead } from './SortableTableHead';

interface Props {
  children: React.ReactNode;
  dataLength: number;
  isVLAN?: boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  tableProps?: TableProps;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
}

type CombinedProps<T> = Omit<OrderByProps<T>, 'data'> & Props;

const TableWrapper = <T extends unknown>(props: CombinedProps<T>) => {
  const {
    dataLength,
    handleOrderChange,
    isVLAN,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    tableProps,
    toggleGroupLinodes,
    toggleLinodeView,
  } = props;

  return (
    <Grid className="m0" container spacing={0} style={{ width: '100%' }}>
      <Grid className="p0" xs={12}>
        <Table
          aria-label="List of Linodes"
          colCount={5}
          rowCount={dataLength}
          stickyHeader
          {...tableProps}
        >
          <SortableTableHead
            handleOrderChange={handleOrderChange}
            isVLAN={isVLAN}
            linodeViewPreference={linodeViewPreference}
            linodesAreGrouped={linodesAreGrouped}
            order={order}
            orderBy={orderBy}
            toggleGroupLinodes={toggleGroupLinodes}
            toggleLinodeView={toggleLinodeView}
          />
          {props.children}
        </Table>
      </Grid>
    </Grid>
  );
};

export default TableWrapper;
