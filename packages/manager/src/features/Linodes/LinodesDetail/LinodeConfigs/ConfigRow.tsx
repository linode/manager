import { Config } from '@linode/api-v4/lib/linodes';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeKernelQuery } from 'src/queries/linodes/linodes';
import { useLinodeVolumesQuery } from 'src/queries/volumes';

import { InterfaceListItem } from './InterfaceListItem';
import { ConfigActionMenu } from './LinodeConfigActionMenu';

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
            <li key={thisDevice} style={{ paddingBottom: 4 }}>
              /dev/{thisDevice} - {label}
            </li>
          );
        })
        .filter(Boolean),
    [volumes, disks, config.devices]
  );

  const deviceLabels = React.useMemo(
    () => <StyledUl>{validDevices}</StyledUl>,
    [validDevices]
  );

  const InterfaceList = (
    <StyledUl>
      {interfaces.map((interfaceEntry, idx) => {
        return (
          <InterfaceListItem
            idx={idx}
            interfaceEntry={interfaceEntry}
            key={interfaceEntry.label ?? 'public' + idx}
          />
        );
      })}
    </StyledUl>
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
      <StyledTableCell>
        <ConfigActionMenu
          config={config}
          label={config.label}
          linodeId={linodeId}
          onBoot={onBoot}
          onDelete={onDelete}
          onEdit={onEdit}
          readOnly={readOnly}
        />
      </StyledTableCell>
    </TableRow>
  );
});

const StyledUl = styled('ul', { label: 'StyledUl' })(({ theme }) => ({
  listStyleType: 'none',
  margin: 0,
  paddingBottom: theme.spacing(),
  paddingLeft: 0,
  paddingTop: theme.spacing(),
}));

const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })({
  '&.MuiTableCell-root': {
    paddingRight: 0,
  },
  padding: '0 !important',
});
