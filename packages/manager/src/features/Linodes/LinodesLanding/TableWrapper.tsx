import { usePreferences } from '@linode/queries';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { Table } from 'src/components/Table';

import { SortableTableHead } from './SortableTableHead';

import type { OrderByProps } from 'src/components/OrderBy';
import type { TableProps } from 'src/components/Table';

interface Props {
  children: React.ReactNode;
  dataLength: number;
  linodesAreGrouped: boolean;
  linodeViewPreference: 'grid' | 'list';
  tableProps?: TableProps;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
}

interface TableWrapperProps<T> extends Omit<OrderByProps<T>, 'data'>, Props {}

const TableWrapper = <T,>(props: TableWrapperProps<T>) => {
  const {
    dataLength,
    handleOrderChange,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    tableProps,
    toggleGroupLinodes,
    toggleLinodeView,
  } = props;

  const { data: isTableStripingEnabled } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );

  return (
    <Grid className="m0" container spacing={0} style={{ width: '100%' }}>
      <Grid className="p0" size={12}>
        <Table
          aria-label="List of Linodes"
          colCount={5}
          rowCount={dataLength}
          stickyHeader
          striped={!linodesAreGrouped && isTableStripingEnabled}
          tableClass={linodesAreGrouped ? 'MuiTable-groupByTag' : ''}
          {...tableProps}
        >
          <SortableTableHead
            handleOrderChange={handleOrderChange}
            linodesAreGrouped={linodesAreGrouped}
            linodeViewPreference={linodeViewPreference}
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
