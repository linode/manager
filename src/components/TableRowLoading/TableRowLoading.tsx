import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

type ClassNames = 'root' | 'tableCell';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  tableCell: {
    padding: 17,
    textAlign: 'center'
  }
});

export interface Props {
  colSpan: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const tableRowLoading: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;
  return (
    <TableRow>
      <TableCell colSpan={props.colSpan} className={classes.tableCell}>
        <CircleProgress mini />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(tableRowLoading);
