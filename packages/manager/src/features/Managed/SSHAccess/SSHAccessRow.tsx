import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu from './SSHAccessActionMenu';

interface Props {
  linodeSetting: Linode.ManagedLinodeSetting;
  requestSettings: () => void;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessRow: React.FunctionComponent<Props> = props => {
  const { linodeSetting, requestSettings, openDrawer } = props;

  /**
   * NOTE: Currently the following API exists in production:
   *
   * When linodeSetting.ssh.access == true, access is DISABLED
   * When linodeSetting.ssh.access == false, access is ENABLED
   *
   * If/when this bug is fixed, the following definition should be used:
   * const isAccessEnabled = linodeSetting.ssh.access;
   */
  const isAccessEnabled = !linodeSetting.ssh.access;

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
        {linodeSetting.ssh.user ? linodeSetting.ssh.user : 'root'}
      </TableCell>
      <TableCell parentColumn="IP" data-qa-managed-ip>
        {linodeSetting.ssh.ip === 'any' ? 'Any' : linodeSetting.ssh.ip}
      </TableCell>
      <TableCell parentColumn="Port" data-qa-managed-port>
        {linodeSetting.ssh.port ? linodeSetting.ssh.port : 22}
      </TableCell>
      <TableCell>
        <ActionMenu
          linodeId={linodeSetting.id}
          isEnabled={isAccessEnabled}
          requestSettings={requestSettings}
          openDrawer={openDrawer}
        />
      </TableCell>
    </TableRow>
  );
};

export default SSHAccessRow;
