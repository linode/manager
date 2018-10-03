import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';

import TableCell from 'src/components/TableCell';

import CircleProgress from 'src/components/CircleProgress';

type ClassNames = 'root'
  | 'tableCell';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  tableCell: {
    padding: 17,
    textAlign: 'center',
  },
});

export interface Props {
  colSpan: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const tableRowLoading: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes } = props;
  return (
    <TableRow>
      <TableCell colSpan={props.colSpan} className={classes.tableCell}>
        <CircleProgress mini />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(tableRowLoading);
