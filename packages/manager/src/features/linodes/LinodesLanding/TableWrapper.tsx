import sync from 'css-animation-sync';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import { TableProps } from 'src/components/Table';
import Table from 'src/components/Table/Table_CMR';
import SortableTableHead_CMR from './SortableTableHead';

const useStyles = makeStyles(() => ({
  paperWrapper: {
    backgroundColor: 'transparent',
  },
}));

interface Props {
  dataLength: number;
  toggleLinodeView: () => 'list' | 'grid';
  linodeViewPreference: 'list' | 'grid';
  toggleGroupLinodes: () => boolean;
  linodesAreGrouped: boolean;
  isVLAN?: boolean;
  tableProps?: TableProps;
}

type CombinedProps = Omit<OrderByProps, 'data'> & Props;

const TableWrapper: React.FC<CombinedProps> = props => {
  const classes = useStyles();

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

  React.useEffect(() => {
    sync('pulse');
  }, []);

  return (
    <Paper className={classes.paperWrapper}>
      <Grid container className="m0" spacing={0} style={{ width: '100%' }}>
        <Grid item xs={12} className="p0">
          <Table
            aria-label="List of Linodes"
            rowCount={dataLength}
            colCount={5}
            {...tableProps}
          >
            <SortableTableHead_CMR
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
    </Paper>
  );
};

export default TableWrapper;
