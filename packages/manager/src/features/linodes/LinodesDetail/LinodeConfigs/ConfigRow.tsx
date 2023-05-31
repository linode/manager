import * as React from 'react';
import { Config, Interface } from '@linode/api-v4/lib/linodes';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import { ConfigActionMenu } from './LinodeConfigActionMenu';
import { useLinodeKernelQuery } from 'src/queries/linodes/linodes';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';

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
}));

interface Props {
  config: Config;
  linodeId: number;
  readOnly: boolean;
  onBoot: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ConfigRow = React.memo((props: Props) => {
  const { config, linodeId, onBoot, onEdit, onDelete, readOnly } = props;

  const { data: kernel } = useLinodeKernelQuery(config.kernel);

  const { data: disks } = useAllLinodeDisksQuery(linodeId);

  const { data: volumes } = useLinodeVolumesQuery(linodeId, {
    // This is not great, but lets us get all of the volumes for a Linode while keeping the store paginated.
    // We can safely do this because linodes can't have more than 64 volumes.
    page_size: API_MAX_PAGE_SIZE,
  });

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
              disks?.find(
                (thisDisk) =>
                  thisDisk.id === config.devices[thisDevice]?.disk_id
              )?.label ?? `disk-${device.disk_id}`;
          } else if (device?.volume_id) {
            label =
              volumes?.data.find(
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
    [volumes, disks, classes.interfaceListItem, config.devices]
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

  return (
    <TableRow key={config.id} data-qa-config={config.label}>
      <TableCell>
        {config.label} – {kernel?.label ?? config.kernel}
      </TableCell>
      <TableCell>{deviceLabels}</TableCell>
      <TableCell>
        {interfaces.length > 0 ? InterfaceList : defaultInterfaceLabel}
      </TableCell>
      <TableCell className={classes.actionInner}>
        <ConfigActionMenu
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
});

export const getInterfaceLabel = (configInterface: Interface): string => {
  if (configInterface.purpose === 'public') {
    return 'Public Internet';
  }

  const interfaceLabel = configInterface.label;
  const ipamAddress = configInterface.ipam_address;
  const hasIPAM = Boolean(ipamAddress);

  return `VLAN: ${interfaceLabel} ${hasIPAM ? `(${ipamAddress})` : ''}`;
};
