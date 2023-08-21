import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ActionMenu from './SSHAccessActionMenu';

interface SSHAccessRowProps {
  linodeSetting: ManagedLinodeSetting;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessRow = (props: SSHAccessRowProps) => {
  const { linodeSetting, openDrawer } = props;

  const isAccessEnabled = linodeSetting.ssh.access;

  return (
    <TableRow
      ariaLabel={linodeSetting.label}
      data-qa-monitor-cell={linodeSetting.id}
      data-testid={'linode-row'}
      key={linodeSetting.id}
    >
      <TableCell data-qa-managed-linode>{linodeSetting.label}</TableCell>
      <TableCell data-qa-managed-ssh-access>
        {isAccessEnabled ? 'Enabled' : 'Disabled'}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-managed-user>{linodeSetting.ssh.user}</TableCell>
        <TableCell data-qa-managed-ip>
          {linodeSetting.ssh.ip === 'any' ? 'Any' : linodeSetting.ssh.ip}
        </TableCell>
        <TableCell data-qa-managed-port>{linodeSetting.ssh.port}</TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          isEnabled={isAccessEnabled}
          linodeId={linodeSetting.id}
          linodeLabel={linodeSetting.label}
          openDrawer={openDrawer}
        />
      </TableCell>
    </TableRow>
  );
};

export default SSHAccessRow;
