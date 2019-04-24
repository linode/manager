import * as classNames from 'classnames';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

type ClassNames = 'root' | 'tableCell' | 'transparent';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  tableCell: {
    padding: 17,
    textAlign: 'center'
    // border: 0
  },
  transparent: {
    backgroundColor: theme.bg.main
  }
});

export interface Props {
  colSpan: number;
  transparent?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const tableRowLoading: React.StatelessComponent<CombinedProps> = props => {
  const { classes, transparent } = props;
  return (
    <TableRow
      className={classNames({
        [classes.transparent]: transparent
      })}
    >
      <TableCell
        colSpan={props.colSpan}
        className={classNames({
          [classes.tableCell]: true,
          [classes.transparent]: transparent
        })}
      >
        <CircleProgress mini />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(tableRowLoading);
