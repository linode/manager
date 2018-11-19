import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

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

const styled = withStyles(styles);

export default styled(TableRowEmptyState);
