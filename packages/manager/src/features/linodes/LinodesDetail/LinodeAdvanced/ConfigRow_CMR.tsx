import { Config, Disk, LinodeInterface } from '@linode/api-v4/lib/linodes';
import { VLAN } from '@linode/api-v4/lib/vlans';
import { Volume } from '@linode/api-v4/lib/volumes';
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
    margin: 0,
    paddingLeft: 0
  },
  interfaceListItem: {
    paddingBottom: 3
  },
  tableCell: {
    verticalAlign: 'top'
  }
}));

interface Props {
  config: Config;
  linodeId: number;
  linodeMemory: number;
  readOnly: boolean;
  linodeDisks: Disk[];
  linodeVolumes: Volume[];
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
    linodeVolumes,
    onBoot,
    onEdit,
    onDelete,
    readOnly,
    linodeInterfaces,
    vlans,
    vlansEnabled
  } = props;

  const classes = useStyles();
  const deviceLabels = React.useMemo(
    () => (
      <ul className={classes.interfaceList}>
        {Object.keys(config.devices)
          .map(thisDevice => {
            const diskId = linodeDisks.find(
              thisDisk => thisDisk.id === config.devices[thisDevice]?.disk_id
            );
            const volume = linodeVolumes.find(
              thisVolume =>
                thisVolume.id === config.devices[thisDevice]?.volume_id
            );
            if (!diskId && !volume) {
              return undefined;
            }
            return (
              <li key={thisDevice} className={classes.interfaceListItem}>
                /dev/{thisDevice} - {diskId ? diskId.label : volume!.label}
              </li>
            );
          })
          .filter(Boolean)}
      </ul>
    ),
    [
      linodeVolumes,
      linodeDisks,
      config,
      classes.interfaceList,
      classes.interfaceListItem
    ]
  );

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
      <TableCell className={classes.tableCell}>{config.label}</TableCell>
      <TableCell className={classes.tableCell}>
        {config.virt_mode === 'fullvirt'
          ? 'Full virtualization'
          : 'Paravirtualization'}
      </TableCell>
      <TableCell className={classes.tableCell}>{linodeKernel}</TableCell>
      <TableCell className={classes.tableCell}>{deviceLabels}</TableCell>
      {vlansEnabled ? (
        <TableCell className={classes.tableCell}>
          {!isEmpty(config.interfaces) ? InterfaceList : defaultInterfaceLabel}
        </TableCell>
      ) : null}
      <TableCell className={`${classes.actionInner} ${classes.tableCell}`}>
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
