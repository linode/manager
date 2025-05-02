import {
  useAllAccountMaintenanceQuery,
  useAllLinodesQuery,
} from '@linode/queries';
import { useFormattedDate } from '@linode/utilities';
import * as React from 'react';

import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';

export const LinodesLandingCSVDownload = () => {
  const csvRef = React.useRef<any>();
  const formattedDate = useFormattedDate();

  const { data: linodes, refetch: getCSVData } = useAllLinodesQuery(
    {},
    {},
    false
  );

  const { data: accountMaintenance } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );

  const downloadCSV = async () => {
    await getCSVData();
    csvRef.current.link.click();
  };

  const headers = [
    { key: 'id', label: 'id' },
    { key: 'label', label: 'label' },
    { key: 'image', label: 'image' },
    { key: 'region', label: 'region' },
    { key: 'ipv4', label: 'ipv4' },
    { key: 'ipv6', label: 'ipv6' },
    { key: 'status', label: 'status' },
    { key: 'type', label: 'type' },
    { key: 'updated', label: 'updated' },
    { key: 'created', label: 'created' },
    { key: 'specs.disk', label: 'disk' },
    { key: 'specs.gpus', label: 'gpus' },
    { key: 'specs.memory', label: 'memory' },
    { key: 'specs.transfer', label: 'transfer' },
    { key: 'specs.vcpus', label: 'vcpus' },
    { key: 'tags', label: 'tags' },
    { key: 'hypervisor', label: 'hypervisor' },
    { key: 'host_uuid', label: 'host_uuid' },
    { key: 'watchdog_enabled', label: 'watchdog_enabled' },
    { key: 'backups.enabled', label: 'backups_enabled' },
    { key: 'backups.last_successful', label: 'last_backup' },
    { key: 'maintenance', label: 'maintenance' },
  ];

  const data =
    linodes?.map((linode) => {
      const maintenanceForLinode =
        accountMaintenance?.find(
          (m) => m.entity.id === linode.id && m.entity.type === 'linode'
        ) ?? null;

      return {
        ...linode,
        maintenance: maintenanceForLinode,
      };
    }) ?? [];

  return (
    <DownloadCSV
      csvRef={csvRef}
      data={data}
      filename={`linodes-${formattedDate}.csv`}
      headers={headers}
      onClick={downloadCSV}
    />
  );
};
