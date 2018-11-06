import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// import { displayPrice } from 'src/components/DisplayPrice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';

import { LinodeWithTypeInfo } from './BackupDrawer';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
  },
});

interface Props {
  linodes: Linode.Linode[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const getLabel = (type?: Linode.LinodeType) =>
  pathOr('Unknown', ['label'], type);

const getPrice = (type?: Linode.LinodeType) =>
  pathOr("Unavailable",['addons', 'backups', 'price', 'monthly'], type);

const BackupsTable: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linodes } = props;
  return (
    <Table tableClass={classes.root} isResponsive={false} >
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Label">Label</TableCell>
          <TableCell data-qa-table-header="Plan" >Plan</TableCell>
          <TableCell data-qa-table-header="Price" >Price</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {linodes && linodes.map((linode: LinodeWithTypeInfo, idx: number) =>
          <TableRow key={idx}>
            <TableCell >{linode.label}</TableCell>
            <TableCell >{getLabel(linode.typeInfo)}</TableCell>
            <TableCell >{getPrice(linode.typeInfo)}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BackupsTable);
