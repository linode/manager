import { useLinodeKernelQuery, useLinodeQuery } from '@linode/queries';
import { List } from '@linode/ui';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { ConfigRowDevice } from './ConfigRowDevices/ConfigRowDevice';
import { InterfaceListItem } from './InterfaceListItem';
import { ConfigActionMenu } from './LinodeConfigActionMenu';

import type { Config, Devices } from '@linode/api-v4';

interface Props {
  config: Config;
  linodeId: number;
  onBoot: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const ConfigRow = React.memo((props: Props) => {
  const { config, linodeId, onBoot, onDelete, onEdit } = props;

  const { data: linode } = useLinodeQuery(linodeId);

  const { data: kernel } = useLinodeKernelQuery(config.kernel);

  const interfaces = config?.interfaces ?? [];

  const InterfaceList = (
    <List sx={{ '> li': { paddingY: 0.25 }, paddingY: 0.5 }}>
      {interfaces.map((interfaceEntry, idx) => (
        <InterfaceListItem
          idx={idx}
          interfaceEntry={interfaceEntry}
          key={interfaceEntry.label ?? 'public' + idx}
        />
      ))}
    </List>
  );

  const defaultInterfaceLabel = 'eth0 – Public Internet';

  return (
    <TableRow data-qa-config={config.label} key={config.id}>
      <TableCell>
        {config.label} – {kernel?.label ?? config.kernel}
      </TableCell>
      <TableCell>
        <List sx={{ '> li': { paddingY: 0.25 }, paddingY: 0.5 }}>
          {Object.entries(config.devices).map(
            ([deviceKey, device]: [keyof Devices, Devices[keyof Devices]]) => (
              <ConfigRowDevice
                device={device}
                deviceKey={deviceKey}
                key={deviceKey}
                linodeId={linodeId}
              />
            )
          )}
        </List>
      </TableCell>
      {linode?.interface_generation !== 'linode' && (
        <TableCell>
          {interfaces.length > 0 ? InterfaceList : defaultInterfaceLabel}
        </TableCell>
      )}
      <TableCell actionCell>
        <ConfigActionMenu
          config={config}
          label={config.label}
          linodeId={linodeId}
          onBoot={onBoot}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  );
});
