import * as React from 'react';
import Table from 'src/components/Table/Table_CMR';
import TableHead from 'src/components/core/TableHead';
import TableBody from 'src/components/core/TableBody';
import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';
import CheckBox from 'src/components/CheckBox';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2)
  },

  checkBox: {
    width: 50
  }
}));

export interface Props {
  headers: string[];
  hasSelectedAll: boolean;
  requestPage: () => void;
  toggleSelectAll: () => void;
  children: JSX.Element[];
}

export const TransferTable: React.FC<Props> = props => {
  const { hasSelectedAll, headers, toggleSelectAll } = props;
  const classes = useStyles();
  return (
    <Table className={classes.root}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.checkBox}>
            <CheckBox
              checked={hasSelectedAll}
              onChange={toggleSelectAll}
              inputProps={{
                'aria-label': `Select all entities on page`
              }}
            />
          </TableCell>
          {headers.map(thisHeader => (
            <TableCell key={`entity-table-header-${thisHeader}`}>
              {thisHeader}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>{props.children}</TableBody>
    </Table>
  );
};

export default React.memo(TransferTable);
