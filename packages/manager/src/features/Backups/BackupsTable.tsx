import { isEmpty } from 'ramda';
import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowLoading from 'src/components/TableRowLoading';
import BackupLinodes from './BackupLinodes';
import { ExtendedLinode } from './types';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
}));

interface Props {
  linodes: ExtendedLinode[];
  loading: boolean;
}

type CombinedProps = Props;

export const BackupsTable: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { linodes, loading } = props;

  return (
    <Table tableClass={classes.root}>
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Label">Label</TableCell>
          <TableCell data-qa-table-header="Plan">Plan</TableCell>
          <TableCell data-qa-table-header="Price">Price</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {loading && isEmpty(linodes) ? (
          <TableRowLoading colSpan={12} />
        ) : (
          <BackupLinodes linodes={linodes} />
        )}
      </TableBody>
    </Table>
  );
};

export default BackupsTable;
