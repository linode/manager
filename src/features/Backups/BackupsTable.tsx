import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import CircleProgress from 'src/components/CircleProgress';
// import { displayPrice } from 'src/components/DisplayPrice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';

import { ExtendedLinode } from './BackupDrawer';

type ClassNames = 'root' | 'container';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    width: '100%',
  },
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface Props {
  linodes: ExtendedLinode[];
  loading: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const getLabel = (type?: Linode.LinodeType) =>
  pathOr('Unknown', ['label'], type);

const getPrice = (type?: Linode.LinodeType) =>
  pathOr("Unavailable",['addons', 'backups', 'price', 'monthly'], type);

const renderLoading = (container: string) =>
  <TableRow className={container} >
    <TableCell>
      <CircleProgress mini />
    </TableCell>
  </TableRow>

const renderLinodes = (linodes: ExtendedLinode[]) =>
  linodes && linodes.map((linode: ExtendedLinode, idx: number) =>
    <React.Fragment key={idx}>
      <TableRow>
        <TableCell >{linode.label}</TableCell>
        <TableCell >{getLabel(linode.typeInfo)}</TableCell>
        <TableCell >{getPrice(linode.typeInfo)}</TableCell>
      </TableRow>
      {/* @todo need error handling pattern for displaying individual
       * errors for each Linode */}
      {/* {linode.linodeError &&
        <TableRow>
          <TableCell>{linode.linodeError.reason}</TableCell>
        </TableRow>
      } */}
      </React.Fragment>
  )

const BackupsTable: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linodes, loading } = props;

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
        {loading && linodes.length === 0
          ? renderLoading(classes.container)
          : renderLinodes(linodes)
        }
      </TableBody>
    </Table>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BackupsTable);
