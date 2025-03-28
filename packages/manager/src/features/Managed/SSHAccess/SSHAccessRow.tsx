import * as React from 'react';

import { Hidden } from '@linode/ui';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ActionMenu from './SSHAccessActionMenu';

import type { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';

interface SSHAccessRowProps {
  linodeSetting: ManagedLinodeSetting;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessRow = (props: SSHAccessRowProps) => {
  const { linodeSetting, openDrawer } = props;

  const isAccessEnabled = linodeSetting.ssh.access;

  return (
    <TableRow
      data-qa-monitor-cell={linodeSetting.id}
      data-testid={'linode-row'}
      key={linodeSetting.id}
    >
      <TableCell data-qa-managed-linode>{linodeSetting.label}</TableCell>
      <TableCell data-qa-managed-ssh-access>
        {isAccessEnabled ? 'Enabled' : 'Disabled'}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-managed-user>
          <MaskableText isToggleable text={linodeSetting.ssh.user} />
        </TableCell>
        <TableCell data-qa-managed-ip>
          {linodeSetting.ssh.ip === 'any' ? (
            'Any'
          ) : (
            <MaskableText
              isToggleable
              length="ipv4"
              text={linodeSetting.ssh.ip}
            />
          )}
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
