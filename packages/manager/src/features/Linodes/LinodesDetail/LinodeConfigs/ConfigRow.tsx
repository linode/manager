import { Config, Interface } from '@linode/api-v4/lib/linodes';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeKernelQuery } from 'src/queries/linodes/linodes';
import { useLinodeVolumesQuery } from 'src/queries/volumes';

import { ConfigActionMenu } from './LinodeConfigActionMenu';

const useStyles = makeStyles()((theme: Theme) => ({
  actionInner: {
    '&.MuiTableCell-root': {
      paddingRight: 0,
    },
    padding: '0 !important',
  },
  interfaceList: {
    listStyleType: 'none',
    margin: 0,
    paddingBottom: theme.spacing(),
    paddingLeft: 0,
    paddingTop: theme.spacing(),
  },
  interfaceListItem: {
    paddingBottom: 4,
  },
}));

interface Props {
  config: Config;
  linodeId: number;
  onBoot: () => void;
  onDelete: () => void;
  onEdit: () => void;
  readOnly: boolean;
}

export const ConfigRow = React.memo((props: Props) => {
  const { config, linodeId, onBoot, onDelete, onEdit, readOnly } = props;

  const { data: kernel } = useLinodeKernelQuery(config.kernel);

  const { data: disks } = useAllLinodeDisksQuery(linodeId);

  const { data: volumes } = useLinodeVolumesQuery(linodeId, {
    // This is not great, but lets us get all of the volumes for a Linode while keeping the store paginated.
    // We can safely do this because linodes can't have more than 64 volumes.
    page_size: API_MAX_PAGE_SIZE,
  });

  const { classes } = useStyles();
  const interfaces = config?.interfaces ?? [];

  const validDevices = React.useMemo(
    () =>
      Object.keys(config.devices)
        .map((thisDevice) => {
          const device = config.devices[thisDevice];
          let label: null | string = null;
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
            <li className={classes.interfaceListItem} key={thisDevice}>
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
            className={classes.interfaceListItem}
            key={interfaceEntry.label ?? 'public' + idx}
          >
            {interfaceName} – {getInterfaceLabel(interfaceEntry)}
          </li>
        );
      })}
    </ul>
  );

  const defaultInterfaceLabel = 'eth0 – Public Internet';

  return (
    <TableRow data-qa-config={config.label} key={config.id}>
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
          label={config.label}
          linodeId={linodeId}
          onBoot={onBoot}
          onDelete={onDelete}
          onEdit={onEdit}
          readOnly={readOnly}
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
