import { Config, Disk, InterfaceBody } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { privateIPRegex } from 'src/utilities/ipUtils';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu';

const useStyles = makeStyles(() => ({
  actionInner: {
    padding: '0 !important',
    '&.MuiTableCell-root': {
      paddingRight: 0,
    },
  },
  interfaceList: {
    listStyleType: 'none',
    margin: 0,
    paddingLeft: 0,
  },
  interfaceListItem: {
    paddingBottom: 4,
  },
  alignTop: {
    verticalAlign: 'top',
  },
}));

interface Props {
  config: Config;
  linodeId: number;
  linodeMemory: number;
  readOnly: boolean;
  linodeDisks: Disk[];
  linodeVolumes: Volume[];
  linodeKernel: string;
  linodeIPs: string[];
}

interface Handlers {
  onBoot: (configId: number, label: string) => void;
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
}

export type CombinedProps = Props & Handlers;

export const ConfigRow: React.FC<CombinedProps> = (props) => {
  const {
    config,
    linodeId,
    linodeDisks,
    linodeKernel,
    linodeIPs,
    linodeVolumes,
    onBoot,
    onEdit,
    onDelete,
    readOnly,
  } = props;

  const classes = useStyles();
  const validDevices = React.useMemo(
    () =>
      Object.keys(config.devices)
        .map((thisDevice) => {
          const device = config.devices[thisDevice];
          let label: string | null = null;
          if (device?.disk_id) {
            label =
              linodeDisks.find(
                (thisDisk) =>
                  thisDisk.id === config.devices[thisDevice]?.disk_id
              )?.label ?? `disk-${device.disk_id}`;
          } else if (device?.volume_id) {
            label =
              linodeVolumes.find(
                (thisVolume) =>
                  thisVolume.id === config.devices[thisDevice]?.volume_id
              )?.label ?? `volume-${device.volume_id}`;
          }

          if (!label) {
            return undefined;
          }
          return (
            <li key={thisDevice} className={classes.interfaceListItem}>
              /dev/{thisDevice} - {label}
            </li>
          );
        })
        .filter(Boolean),
    [linodeVolumes, linodeDisks, classes.interfaceListItem, config.devices]
  );

  const deviceLabels = React.useMemo(
    () => <ul className={classes.interfaceList}>{validDevices}</ul>,
    [classes.interfaceList, validDevices]
  );

  const hasPrivateIP = linodeIPs.some((thisIP) => privateIPRegex.test(thisIP));

  const InterfaceList = (
    <ul className={classes.interfaceList}>
      {config.interfaces.map((interfaceEntry, idx) => {
        // The order of the config.interfaces array as returned by the API is significant.
        // Index 0 is eth0, index 1 is eth1, index 2 is eth2.
        const interfaceName = `eth${idx}`;

        return (
          <li
            key={interfaceEntry.label + idx}
            className={classes.interfaceListItem}
          >
            {interfaceName} – {getInterfaceLabel(interfaceEntry, hasPrivateIP)}
          </li>
        );
      })}
    </ul>
  );

  const defaultInterfaceLabel = hasPrivateIP
    ? 'eth0 – PUBLIC, PRIVATE'
    : 'eth0 – PUBLIC';

  // This should determine alignment based on device count associated w/ a config
  const hasManyConfigs = validDevices.length > 3;

  return (
    <TableRow
      className={hasManyConfigs ? classes.alignTop : undefined}
      key={config.id}
      data-qa-config={config.label}
    >
      <TableCell>
        {config.label} – {linodeKernel}
      </TableCell>
      <TableCell>{deviceLabels}</TableCell>
      <TableCell>
        {!isEmpty(config.interfaces) ? InterfaceList : defaultInterfaceLabel}
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
  configInterface: InterfaceBody,
  hasPrivateIP: boolean
): string => {
  if (configInterface.purpose === 'public') {
    return hasPrivateIP ? 'PUBLIC, PRIVATE' : 'PUBLIC';
  }

  const interfaceLabel = configInterface.label;
  const ipamAddress = configInterface.ipam_address;
  const hasIPAM = Boolean(ipamAddress);

  return `VLAN: ${interfaceLabel} ${hasIPAM ? `(${ipamAddress})` : ''}`;
};
