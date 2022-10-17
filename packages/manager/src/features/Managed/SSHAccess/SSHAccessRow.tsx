import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu from './SSHAccessActionMenu';

interface Props {
  linodeSetting: ManagedLinodeSetting;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessRow: React.FunctionComponent<Props> = (props) => {
  const { linodeSetting, openDrawer } = props;

  const isAccessEnabled = linodeSetting.ssh.access;

  return (
    <TableRow
      key={linodeSetting.id}
      data-qa-monitor-cell={linodeSetting.id}
      data-testid={'linode-row'}
      ariaLabel={linodeSetting.label}
    >
      <TableCell data-qa-managed-linode>{linodeSetting.label}</TableCell>
      <TableCell data-qa-managed-ssh-access>
        {isAccessEnabled ? 'Enabled' : 'Disabled'}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-managed-user>{linodeSetting.ssh.user}</TableCell>
        <TableCell data-qa-managed-ip>
          {linodeSetting.ssh.ip === 'any' ? 'Any' : linodeSetting.ssh.ip}
        </TableCell>
        <TableCell data-qa-managed-port>{linodeSetting.ssh.port}</TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          linodeId={linodeSetting.id}
          isEnabled={isAccessEnabled}
          openDrawer={openDrawer}
          linodeLabel={linodeSetting.label}
        />
      </TableCell>
    </TableRow>
  );
};

export default SSHAccessRow;
