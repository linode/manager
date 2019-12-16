import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
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
      textAlign: 'center'
    },
    transparent: {
      backgroundColor: theme.bg.main
    }
  });

export interface Props {
  colSpan: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  numberOfRows?: number;
  firstColWidth?: number;
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
    firstColWidth,
    oneLine,
    numberOfRows,
    hasEntityIcon,
    compact
  } = props;

  const rows: JSX.Element[] = [];
  const ifRows = numberOfRows !== undefined ? numberOfRows : 1;
  const rowBuilder = (rowCount: number) => {
    for (rowCount = 0; rowCount <= ifRows - 1; rowCount++) {
      rows.push(
        <TableRow
          className={classNames({
            [classes.transparent]: transparent
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
              [classes.transparent]: transparent
            })}
          >
            <Skeleton
              table
              columns={colSpan ? colSpan : 8}
              firstColWidth={firstColWidth ? firstColWidth : undefined}
              oneLine={oneLine}
              compact={compact}
              hasEntityIcon={hasEntityIcon}
            />
          </TableCell>
        </TableRow>
      );
    }
  };

  return (
    <>
      {rowBuilder(ifRows)}
      {rows}
    </>
  );
};

const styled = withStyles(styles);

export default styled(tableRowLoading);
