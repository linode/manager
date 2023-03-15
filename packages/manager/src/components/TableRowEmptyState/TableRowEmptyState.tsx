import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderColor: theme.borderColors.borderTable,
    textAlign: 'center',
  },
}));

export interface Props {
  colSpan: number;
  message?: string | JSX.Element;
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
