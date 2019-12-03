import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import Drawer from 'src/components/Drawer';
import Table from 'src/components/Table';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import withLongviewStats, {
  DispatchProps,
  LVClientData
} from 'src/containers/longview.stats.container';
import LongviewPackageRow from './LongviewPackageRow';
import { LongviewPackage } from './request.types';

const useStyles = makeStyles((theme: Theme) => ({
  new: {
    color: theme.color.green
  }
}));

interface Props {
  clientLabel: string;
  clientID: number;
  isOpen: boolean;
  onClose: () => void;
}

type CombinedProps = Props & DispatchProps & LVClientData;

export const LongviewPackageDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, clientLabel, longviewClientData, onClose } = props;

  const classes = useStyles();

  const lvPackages: LongviewPackage[] = pathOr(
    [],
    ['Packages'],
    longviewClientData
  );

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      title={`${clientLabel}: Package Updates`}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '40%' }}>Package</TableCell>
            <TableCell>
              Installed Version{` `}/{` `}
              <span className={classes.new}>Latest Version</span>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lvPackages.length > 0 ? (
            lvPackages.map((thisPackage, idx) => (
              <LongviewPackageRow
                lvPackage={thisPackage}
                key={`package-drawer-row-${idx}`}
              />
            ))
          ) : (
            /**
             * This drawer should only ever be open-able
             * when there is available package data,
             * so this is a default empty state as a
             * catch-all just in case.
             *
             * Similarly, if lvClientData is loading
             * or errors out, the drawer will (should)
             * not be open-able, so no explicit logic
             * is included here.
             */
            <TableRowEmptyState colSpan={12} />
          )}
        </TableBody>
      </Table>
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withLongviewStats<Props>(own => own.clientID)
);
export default enhanced(LongviewPackageDrawer);
