import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'center'
    }
  });

export interface Props {
  colSpan: number;
  message?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableRowEmptyState: React.FC<CombinedProps> = props => {
  const { classes } = props;
  return (
    <TableRow data-testid={'table-row-empty'}>
      <TableCell colSpan={props.colSpan} className={classes.root}>
        {props.message || 'No items to display.'}
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(TableRowEmptyState);
