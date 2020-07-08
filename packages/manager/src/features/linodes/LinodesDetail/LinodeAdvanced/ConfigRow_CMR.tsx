import { Config, Disk, getLinodeDisks } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu_CMR';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

interface Props {
  config: Config;
  linodeId: number;
  linodeMemory: number;
  readOnly: boolean;
}

interface Handlers {
  onBoot: (linodeId: number, configId: number, label: string) => void;
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
}

export type CombinedProps = Props & Handlers;

export const ConfigRow: React.FC<CombinedProps> = props => {
  const {
    config,
    linodeId,
    linodeMemory,
    onBoot,
    onEdit,
    onDelete,
    readOnly
  } = props;

  const assembleRootDeviceInfo = (config: Config, linodeId: number) => {
    const rootDevice = config.root_device;
    const device = rootDevice.slice(-3); // Isolate the 'sda', 'sdc', etc. piece

    const deviceId = config.devices[device].disk_id;

    getLinodeDisks(linodeId)
      .then(response => {
        const label = response.data.filter(
          (disk: Disk) => disk.id === deviceId
        );
        return `${rootDevice} – ${label}`;
      })
      .catch(() => {
        return null;
      });
  };

  // If config.memory_limit === 0, use linodeMemory; the API interprets a memory limit of 0 as the RAM of the Linode itself.
  return (
    <TableRow key={config.id} data-qa-config={config.label}>
      <TableCell>{config.label}</TableCell>
      <TableCell>
        {config.virt_mode === 'fullvirt'
          ? 'Full virtualization'
          : 'Paravirtualization'}
      </TableCell>
      <TableCell>GRUB 2</TableCell>
      <TableCell>
        {config.memory_limit === 0
          ? `${linodeMemory} GB`
          : `${config.memory_limit} MB`}
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <LinodeConfigActionMenu
          config={config}
          linodeId={linodeId}
          onBoot={onBoot}
          onEdit={onEdit}
          onDelete={onDelete}
          readOnly={readOnly}
          label={config.label}
        />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(ConfigRow);
