import { useTheme } from '@mui/material/styles';
import { pathOr } from 'ramda';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import withLongviewStats, {
  DispatchProps,
  LVClientData,
} from 'src/containers/longview.stats.container';

import { LongviewPackageRow } from './LongviewPackageRow';
import { LongviewPackage } from './request.types';

interface Props {
  clientID: number;
  clientLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

type CombinedProps = Props & DispatchProps & LVClientData;

export const LongviewPackageDrawer = withLongviewStats<Props>(
  (own) => own.clientID
)((props: CombinedProps) => {
  const { clientLabel, isOpen, longviewClientData, onClose } = props;
  const theme = useTheme();

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
              <Box component="span" color={theme.color.green}>
                Latest Version
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lvPackages.length > 0 ? (
            lvPackages.map((thisPackage, idx) => (
              <LongviewPackageRow
                key={`package-drawer-row-${idx}`}
                lvPackage={thisPackage}
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
            <TableRowEmpty colSpan={12} />
          )}
        </TableBody>
      </Table>
    </Drawer>
  );
});
