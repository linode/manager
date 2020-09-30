import { Config, Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';

const useStyles = makeStyles(() => ({
  actionInner: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 0,
    '&.MuiTableCell-root': {
      paddingRight: 0
    }
  }
}));

interface Props {
  config: Config;
  linodeId: number;
  linodeMemory: number;
  readOnly: boolean;
  linodeDisks: Disk[];
  linodeKernel: string;
}

interface Handlers {
  onBoot: (configId: number, label: string) => void;
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
}

export type CombinedProps = Props & Handlers;

export const ConfigRow: React.FC<CombinedProps> = props => {
  const {
    config,
    linodeId,
    linodeDisks,
    linodeKernel,
    onBoot,
    onEdit,
    onDelete,
    readOnly
  } = props;

  const classes = useStyles();

  const [rootDeviceLabel, setRootDeviceLabel] = React.useState<string>('');

  React.useEffect(() => {
    const rootDevice = config.root_device;
    const device = rootDevice.slice(-3); // Isolate the 'sda', 'sdc', etc. piece

    const deviceId = config.devices[device]?.disk_id;

    const matchingDisk = linodeDisks.find(disk => disk.id === deviceId);
    const label = matchingDisk ? ` – ${matchingDisk.label}` : '';
    setRootDeviceLabel(`${rootDevice}${label}`);
  }, [config, linodeDisks]);

  return (
    <TableRow key={config.id} data-qa-config={config.label}>
      <TableCell>{config.label}</TableCell>
      <TableCell>
        {config.virt_mode === 'fullvirt'
          ? 'Full virtualization'
          : 'Paravirtualization'}
      </TableCell>
      <TableCell>{linodeKernel}</TableCell>
      <TableCell>{rootDeviceLabel}</TableCell>
      <TableCell>Interfaces</TableCell>
      <TableCell className={classes.actionInner}>
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
