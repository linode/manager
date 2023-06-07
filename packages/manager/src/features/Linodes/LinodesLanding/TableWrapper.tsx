import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { OrderByProps } from 'src/components/OrderBy';
import { Table, TableProps } from 'src/components/Table';
import SortableTableHead from './SortableTableHead';

interface Props {
  dataLength: number;
  toggleLinodeView: () => 'list' | 'grid';
  linodeViewPreference: 'list' | 'grid';
  toggleGroupLinodes: () => boolean;
  linodesAreGrouped: boolean;
  isVLAN?: boolean;
  tableProps?: TableProps;
  children: React.ReactNode;
}

type CombinedProps<T> = Omit<OrderByProps<T>, 'data'> & Props;

const TableWrapper = <T extends unknown>(props: CombinedProps<T>) => {
  const {
    dataLength,
    order,
    orderBy,
    handleOrderChange,
    toggleLinodeView,
    linodeViewPreference,
    toggleGroupLinodes,
    linodesAreGrouped,
    isVLAN,
    tableProps,
  } = props;

  return (
    <Grid container className="m0" spacing={0} style={{ width: '100%' }}>
      <Grid xs={12} className="p0">
        <Table
          aria-label="List of Linodes"
          rowCount={dataLength}
          colCount={5}
          stickyHeader
          {...tableProps}
        >
          <SortableTableHead
            order={order}
            orderBy={orderBy}
            handleOrderChange={handleOrderChange}
            toggleGroupLinodes={toggleGroupLinodes}
            linodeViewPreference={linodeViewPreference}
            toggleLinodeView={toggleLinodeView}
            linodesAreGrouped={linodesAreGrouped}
            isVLAN={isVLAN}
          />
          {props.children}
        </Table>
      </Grid>
    </Grid>
  );
};

export default TableWrapper;
