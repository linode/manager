import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import ErrorState from 'src/components/ErrorState';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

export interface Props {
  colSpan: number;
  message: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableRowError: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <TableRow>
    <TableCell colSpan={props.colSpan}>
      <ErrorState errorText={props.message} compact />
    </TableCell>
  </TableRow>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TableRowError);
