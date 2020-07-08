import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu_CMR';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';

interface Props {
  config: Config;
  linodeId: number;
  readOnly: boolean;
}

interface Handlers {
  onBoot: (linodeId: number, configId: number, label: string) => void;
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
}

export type CombinedProps = Props & Handlers;

export const ConfigRow: React.FC<CombinedProps> = props => {
  const { config, linodeId, onBoot, onEdit, onDelete, readOnly } = props;
  return (
    <TableRow key={config.id} data-qa-config={config.label}>
      <TableCell>{config.label}</TableCell>
      <TableCell>
        {config.virt_mode === 'fullvirt'
          ? 'Full virtualization'
          : 'Paravirtualization'}
      </TableCell>
      <TableCell>GRUB 2</TableCell>
      <TableCell>4 GB</TableCell>
      <TableCell>/dev/sda</TableCell>
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
