import { Box, Drawer } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import withLongviewStats from 'src/containers/longview.stats.container';

import { LongviewPackageRow } from './LongviewPackageRow';

import type { LongviewPackage } from './request.types';
import type {
  DispatchProps,
  LVClientData,
} from 'src/containers/longview.stats.container';

interface Props {
  clientID: number;
  clientLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LongviewPackageDrawerProps
  extends Props,
    DispatchProps,
    LVClientData {}

export const LongviewPackageDrawer = withLongviewStats<Props>(
  (own) => own.clientID
)((props: LongviewPackageDrawerProps) => {
  const { clientLabel, isOpen, longviewClientData, onClose } = props;
  const theme = useTheme();

  const lvPackages: LongviewPackage[] = longviewClientData?.Packages ?? [];

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
              <Box color={theme.color.green} component="span">
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
