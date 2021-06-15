import { Config, Disk, Interface } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  actionInner: {
    padding: '0 !important',
    '&.MuiTableCell-root': {
      paddingRight: 0,
    },
  },
  interfaceList: {
    listStyleType: 'none',
    margin: 0,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
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
    linodeVolumes,
    onBoot,
    onEdit,
    onDelete,
    readOnly,
  } = props;

  const classes = useStyles();
  const interfaces = config?.interfaces ?? [];
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

  const InterfaceList = (
    <ul className={classes.interfaceList}>
      {interfaces.map((interfaceEntry, idx) => {
        // The order of the config.interfaces array as returned by the API is significant.
        // Index 0 is eth0, index 1 is eth1, index 2 is eth2.
        const interfaceName = `eth${idx}`;

        return (
          <li
            key={interfaceEntry.label ?? 'public' + idx}
            className={classes.interfaceListItem}
          >
            {interfaceName} – {getInterfaceLabel(interfaceEntry)}
          </li>
        );
      })}
    </ul>
  );

  const defaultInterfaceLabel = 'eth0 – Public Internet';

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
        {!isEmpty(interfaces) ? InterfaceList : defaultInterfaceLabel}
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

export const getInterfaceLabel = (configInterface: Interface): string => {
  if (configInterface.purpose === 'public') {
    return 'Public Internet';
  }

  const interfaceLabel = configInterface.label;
  const ipamAddress = configInterface.ipam_address;
  const hasIPAM = Boolean(ipamAddress);

  return `VLAN: ${interfaceLabel} ${hasIPAM ? `(${ipamAddress})` : ''}`;
};
