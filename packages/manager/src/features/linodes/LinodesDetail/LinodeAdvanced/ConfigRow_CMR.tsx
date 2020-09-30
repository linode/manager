import { Config, Disk, LinodeInterface } from '@linode/api-v4/lib/linodes';
import { VLAN } from '@linode/api-v4/lib/vlans';
import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import { Link } from 'src/components/Link';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu_CMR';

const useStyles = makeStyles(() => ({
  actionInner: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 0,
    '&.MuiTableCell-root': {
      paddingRight: 0
    }
  },
  interfaceList: {
    listStyleType: 'none',
    padding: `4px 0 4px 0`,
    margin: 0
  },
  interfaceListItem: {
    paddingTop: 2,
    paddingBottom: 2
  }
}));

interface Props {
  config: Config;
  linodeId: number;
  linodeMemory: number;
  readOnly: boolean;
  linodeDisks: Disk[];
  linodeKernel: string;
  interfaces: LinodeInterface[];
  vlans: Record<string, VLAN>;
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
    readOnly,
    interfaces,
    vlans
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

  const InterfaceList = Object.keys(config.interfaces).map(interfaceName => {
    const interfaceId = config.interfaces[interfaceName].id;

    const linodeInterface = interfaces.find(
      thisInterface => thisInterface.id === interfaceId
    );

    if (!linodeInterface) {
      return null;
    }

    const label = getInterfaceLabel(linodeInterface, vlans);

    return (
      <li key={config.id + interfaceName} className={classes.interfaceListItem}>
        {interfaceName} – {label}
      </li>
    );
  });

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
      <TableCell>
        <ul className={classes.interfaceList}>{InterfaceList}</ul>
      </TableCell>
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

export const getInterfaceLabel = (
  linodeInterface: LinodeInterface,
  vlans: Record<string, VLAN>
) => {
  if (linodeInterface.type === 'default') {
    return 'Public';
  }

  const vlan = vlans[linodeInterface.vlan_id];

  // I don't think this woulod ever happen, but here's a fallback anyway.
  if (!vlan) {
    return linodeInterface.description;
  }

  return <Link to={`/vlans/${vlan.id}`}>{vlan.description}</Link>;
};
