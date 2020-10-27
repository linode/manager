import { Config, Disk, LinodeInterface } from '@linode/api-v4/lib/linodes';
import { VLAN } from '@linode/api-v4/lib/vlans';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import { Link } from 'src/components/Link';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { privateIPRegex } from 'src/utilities/ipUtils';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu_CMR';

const useStyles = makeStyles(() => ({
  actionInner: {
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
  linodeInterfaces: LinodeInterface[];
  linodeIPs: string[];
  vlans: Record<string, VLAN>;
  vlansEnabled: boolean;
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
    linodeIPs,
    onBoot,
    onEdit,
    onDelete,
    readOnly,
    linodeInterfaces,
    vlans,
    vlansEnabled
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

  const hasPrivateIP = linodeIPs.some(thisIP => privateIPRegex.test(thisIP));

  const InterfaceList = (
    <ul className={classes.interfaceList}>
      {Object.keys(config.interfaces).map(interfaceName => {
        const linodeInterface = linodeInterfaces.find(
          thisInterface =>
            thisInterface.id === config.interfaces[interfaceName]?.id
        );

        // Just a failsafe.
        if (!linodeInterface) {
          return null;
        }

        return (
          <li
            key={config.id + interfaceName}
            className={classes.interfaceListItem}
          >
            {interfaceName} –{' '}
            {getInterfaceLabel(linodeInterface, vlans, hasPrivateIP)}
          </li>
        );
      })}
    </ul>
  );

  const defaultInterfaceLabel = hasPrivateIP
    ? 'eth0 – Public, Private'
    : 'eth0 – Public';

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
      {vlansEnabled ? (
        <TableCell>
          {!isEmpty(config.interfaces) ? InterfaceList : defaultInterfaceLabel}
        </TableCell>
      ) : null}
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
  vlans: Record<string, VLAN>,
  hasPrivateIP: boolean
) => {
  if (linodeInterface.type === 'default') {
    // @todo: Use the linodeInterface.description if and when it accounts for Private IPs
    return hasPrivateIP ? 'Public, Private' : 'Public';
  }

  const vlan = vlans[linodeInterface.vlan_id];

  // I don't think this would ever happen, but here's a fallback anyway.
  if (!vlan) {
    return linodeInterface.description;
  }

  // @todo: this should be vlan.label whenever that's available.
  return <Link to={`/vlans/${vlan.id}`}>{vlan.description}</Link>;
};
