import { ManagedLinodeSetting } from 'linode-js-sdk/lib/managed/types';
import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu from './SSHAccessActionMenu';

interface Props {
  linodeSetting: ManagedLinodeSetting;
  updateOne: (linodeSetting: ManagedLinodeSetting) => void;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessRow: React.FunctionComponent<Props> = props => {
  const { linodeSetting, updateOne, openDrawer } = props;

  const isAccessEnabled = linodeSetting.ssh.access;

  return (
    <TableRow
      key={linodeSetting.id}
      data-qa-monitor-cell={linodeSetting.id}
      data-testid={'linode-row'}
    >
      <TableCell parentColumn="Linode" data-qa-managed-linode>
        {linodeSetting.label}
      </TableCell>
      <TableCell parentColumn="SSH Access" data-qa-managed-ssh-access>
        {isAccessEnabled ? 'Enabled' : 'Disabled'}
      </TableCell>
      <TableCell parentColumn="User" data-qa-managed-user>
        {linodeSetting.ssh.user}
      </TableCell>
      <TableCell parentColumn="IP" data-qa-managed-ip>
        {linodeSetting.ssh.ip === 'any' ? 'Any' : linodeSetting.ssh.ip}
      </TableCell>
      <TableCell parentColumn="Port" data-qa-managed-port>
        {linodeSetting.ssh.port}
      </TableCell>
      <TableCell>
        <ActionMenu
          linodeId={linodeSetting.id}
          isEnabled={isAccessEnabled}
          updateOne={updateOne}
          openDrawer={openDrawer}
        />
      </TableCell>
    </TableRow>
  );
};

export default SSHAccessRow;
