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
import { srSpeak } from 'src/utilities/accessibility';

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
  firstColWidth?: number;
  transparent?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TableRowLoading extends React.Component<CombinedProps> {
  componentWillUnmount() {
    srSpeak('Table content has loaded', 'polite');
  }

  render() {
    const { classes, transparent, colSpan, firstColWidth } = this.props;
    return (
      <TableRow
        className={classNames({
          [classes.transparent]: transparent
        })}
        data-testid="table-row-loading"
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
          />
        </TableCell>
      </TableRow>
    );
  }
}

const styled = withStyles(styles);

export default styled(TableRowLoading);
