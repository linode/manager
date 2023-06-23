/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { useFormattedDate } from 'src/hooks/useFormattedDate';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

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
    { status: { '+or': ['pending, started'] } }
  );

  const downloadCSV = async () => {
    await getCSVData();
    csvRef.current.link.click();
  };

  const headers = [
    { label: 'id', key: 'id' },
    { label: 'label', key: 'label' },
    { label: 'image', key: 'image' },
    { label: 'region', key: 'region' },
    { label: 'ipv4', key: 'ipv4' },
    { label: 'ipv6', key: 'ipv6' },
    { label: 'status', key: 'status' },
    { label: 'type', key: 'type' },
    { label: 'updated', key: 'updated' },
    { label: 'created', key: 'created' },
    { label: 'disk', key: 'specs.disk' },
    { label: 'gpus', key: 'specs.gpus' },
    { label: 'memory', key: 'specs.memory' },
    { label: 'transfer', key: 'specs.transfer' },
    { label: 'vcpus', key: 'specs.vcpus' },
    { label: 'tags', key: 'tags' },
    { label: 'hypervisor', key: 'hypervisor' },
    { label: 'host_uuid', key: 'host_uuid' },
    { label: 'watchdog_enabled', key: 'watchdog_enabled' },
    { label: 'backups_enabled', key: 'backups.enabled' },
    { label: 'last_backup', key: 'backups.last_successful' },
    { label: 'maintenance', key: 'maintenance' },
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
