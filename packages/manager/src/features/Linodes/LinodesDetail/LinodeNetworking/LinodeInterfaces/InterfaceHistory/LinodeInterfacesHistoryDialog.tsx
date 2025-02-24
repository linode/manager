import { Dialog } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { useLinodeInterfacesHistory } from 'src/queries/linodes/interfaces';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const LinodeInterfacesHistoryDialog = (props: Props) => {
  const { linodeId, onClose, open } = props;

  const { data: interfaceHistory } = useLinodeInterfacesHistory(linodeId, open);

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title="Network Interfaces History"
    >
      <Table>
        <TableHead>
          <TableRow>
            {/* todo: change to table sort cells */}
            <TableCell>Created</TableCell>
            <TableCell>Interface ID</TableCell>
            <TableCell>Linode ID</TableCell>
            <TableCell>Event ID</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {interfaceHistory?.data.map((history) => (
            <TableRow key={history.interface_history_id}>
              <TableCell>
                <DateTimeDisplay value={history.created} />
              </TableCell>
              <TableCell>{history.interface_id}</TableCell>
              <TableCell>{history.linode_id}</TableCell>
              <TableCell>{history.event_id}</TableCell>
              <TableCell>{history.version}</TableCell>
              <TableCell>{history.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ActionsPanel
        secondaryButtonProps={{
          label: 'Close',
          onClick: onClose,
        }}
      />
    </Dialog>
  );
};
