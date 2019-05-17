import { isEmpty } from 'ramda';
import * as React from 'react';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowLoading from 'src/components/TableRowLoading';
import { ExtendedLinode } from './BackupDrawer';
import BackupLinodes from './BackupLinodes';

type ClassNames = 'root' | 'container';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    width: '100%'
  },
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

interface Props {
  linodes: ExtendedLinode[];
  loading: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const BackupsTable: React.StatelessComponent<CombinedProps> = props => {
  const { classes, linodes, loading } = props;

  return (
    <Table tableClass={classes.root} border spacingTop={16}>
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

const styled = withStyles(styles);

export default styled(BackupsTable);
