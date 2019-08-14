import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

interface Props {
  linodeSetting: Linode.ManagedLinodeSetting;
}

export const SSHAccessRow: React.FunctionComponent<Props> = props => {
  const { linodeSetting } = props;

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
        {/* NOTE: There's currently an API oddity where `ssh.access: true` means access is DISABLED.
        If/when this bug is fixed, this logic should be adjusted too. */}
        {!linodeSetting.ssh.access ? 'Enabled' : 'Disabled'}
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
      {/* @todo: action menu */}
    </TableRow>
  );
};

export default SSHAccessRow;
