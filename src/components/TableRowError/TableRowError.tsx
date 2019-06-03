import * as React from 'react';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import ErrorState from 'src/components/ErrorState';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

export interface Props {
  colSpan: number;
  message: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableRowError: React.StatelessComponent<CombinedProps> = props => {
  return (
    <TableRow>
      <TableCell colSpan={props.colSpan}>
        <ErrorState errorText={props.message} compact />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(TableRowError);
