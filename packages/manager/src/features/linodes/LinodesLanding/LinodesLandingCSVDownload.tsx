/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { CSVLink } from 'react-csv';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { DateTime } from 'luxon';
import { useProfile } from 'src/queries/profile';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  csvLink: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
    color: theme.textColors.tableHeader,
    fontSize: '.9rem',
  },
}));

export const LinodesLandingCSVDownload = () => {
  const csvRef = React.useRef<any>();

  const { classes } = useStyles();

  const { data: profile } = useProfile();

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
    <>
      <CSVLink
        ref={csvRef}
        data={data}
        headers={headers}
        filename={`linodes-${DateTime.now().setZone(profile?.timezone)}.csv`}
      />
      <a className={classes.csvLink} onClick={downloadCSV} aria-hidden="true">
        Download CSV
      </a>
    </>
  );
};
