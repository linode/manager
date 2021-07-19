import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Skeleton from 'src/components/Skeleton';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

const useStyles = makeStyles((theme: Theme) => ({
  tableCell: {
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
  transparent: {
    backgroundColor: theme.bg.main,
  },
}));

type Columns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Props {
  colSpan: Columns;
  numberOfRows?: number;
  numberOfColumns?: Columns;
  widths?: number[];
  transparent?: any;
  oneLine?: boolean;
  compact?: boolean;
  hasEntityIcon?: boolean;
}

type CombinedProps = Props;

export const TableRowLoading: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    transparent,
    colSpan,
    widths,
    oneLine,
    numberOfRows,
    hasEntityIcon,
    compact,
    numberOfColumns,
  } = props;

  // Default number of columns for the <Skeleton />.
  let numColumns: Columns = 8;

  // If the consumer has explicitly specified the number of columns to use, go with that.
  // This may be different than colSpan... for example, if one column contains an Icon,
  // we'd like colSpan to be numberOfColumns + 1.
  if (numberOfColumns) {
    numColumns = numberOfColumns;
    // Otherwise if they've specified a colSpan, use that, since it's a pretty good guess.
  } else if (colSpan) {
    numColumns = colSpan;
  }

  const ifRows = numberOfRows ?? 1;
  const rowBuilder = () => {
    const rows: JSX.Element[] = [];
    for (let rowCount = 0; rowCount <= ifRows - 1; rowCount++) {
      rows.push(
        <TableRow
          className={classNames({
            [classes.transparent]: transparent,
          })}
          data-testid="table-row-loading"
          aria-label="Table content is loading"
          key={`table-row-loading-${rowCount}`}
        >
          <TableCell
            colSpan={colSpan}
            className={classNames({
              [classes.tableCell]: true,
              [classes.transparent]: transparent,
            })}
          >
            <Skeleton
              table
              numColumns={numColumns}
              widths={widths}
              oneLine={oneLine}
              compact={compact}
              hasEntityIcon={hasEntityIcon}
            />
          </TableCell>
        </TableRow>
      );
    }
    return rows;
  };

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{rowBuilder()}</>;
};

export default TableRowLoading;
