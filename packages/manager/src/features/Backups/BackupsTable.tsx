import { makeStyles } from '@mui/styles';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import BackupLinodes from './BackupLinodes';
import { ExtendedLinode } from './types';

const useStyles = makeStyles(() => ({
  container: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  root: {
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
          <TableRowLoading columns={3} />
        ) : (
          <BackupLinodes linodes={linodes} />
        )}
      </TableBody>
    </Table>
  );
};

export default BackupsTable;
