import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

export interface Props {
  colSpan: number;
  message?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableRowEmptyState: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <TableRow>
      <TableCell colSpan={props.colSpan} style={{ textAlign: 'center' }}>{props.message || 'No items to display.'}</TableCell>
    </TableRow>

  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TableRowEmptyState);
