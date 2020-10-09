import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Table from 'src/components/Table/Table_CMR';
import SortableTableHead_CMR from './SortableTableHead_CMR';

const useStyles = makeStyles(() => ({
  '@keyframes blink': {
    '0%': {
      opacity: 1
    },
    '50%': {
      opacity: 0.25
    },
    '100%': {
      opacity: 1
    }
  },
  paperWrapper: {
    backgroundColor: 'transparent'
  },
  table: {
    '& .statusOther': {
      animation: '$blink 2.5s linear infinite'
    }
  }
}));

interface Props {
  dataLength: number;
  toggleLinodeView: () => 'list' | 'grid';
  linodeViewPreference: 'list' | 'grid';
  toggleGroupLinodes: () => boolean;
  linodesAreGrouped: boolean;
  isVLAN?: boolean;
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
    isVLAN
  } = props;

  return (
    <Paper className={classes.paperWrapper}>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table
            aria-label="List of Linodes"
            rowCount={dataLength}
            colCount={5}
            className={classes.table}
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
