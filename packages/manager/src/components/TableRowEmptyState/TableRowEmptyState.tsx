import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    textAlign: 'center',
    borderColor: theme.cmrBorderColors.borderTable,
  },
}));

export interface Props {
  colSpan: number;
  message?: string;
}

type CombinedProps = Props;

const TableRowEmptyState: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  return (
    <TableRow data-testid={'table-row-empty'}>
      <TableCell colSpan={props.colSpan} className={classes.root}>
        {props.message || 'No items to display.'}
      </TableCell>
    </TableRow>
  );
};

export default TableRowEmptyState;
