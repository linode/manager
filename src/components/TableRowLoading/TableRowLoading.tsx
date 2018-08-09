import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import CircleProgress from 'src/components/CircleProgress';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  colSpan: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const tableRowLoading: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <TableRow>
      <TableCell colSpan={props.colSpan}>
        <CircleProgress mini />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(tableRowLoading);
