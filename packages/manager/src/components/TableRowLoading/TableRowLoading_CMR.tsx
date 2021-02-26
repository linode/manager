import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Skeleton from 'src/components/Skeleton';

type ClassNames = 'root' | 'tableCell' | 'transparent';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    tableCell: {
      paddingTop: 0,
      paddingBottom: 0,
      textAlign: 'center',
    },
    transparent: {
      backgroundColor: theme.bg.main,
    },
  });

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

type CombinedProps = Props & WithStyles<ClassNames>;

const tableRowLoading: React.FC<CombinedProps> = props => {
  const {
    classes,
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
          style={compact ? { height: 'auto' } : undefined}
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

  return <>{rowBuilder()}</>;
};

const styled = withStyles(styles);

export default styled(tableRowLoading);
