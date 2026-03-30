import { Box, Chip } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getIsLinkInactive } from 'src/features/Databases/utilities';
import { determineNoneSingleOrMultipleWithChip } from 'src/utilities/noneSingleOrMultipleWithChip';

import type {
  DatabaseInstance,
  SubnetAssignedDatabaseData,
} from '@linode/api-v4';

interface Props {
  assignedDatabase: SubnetAssignedDatabaseData;
  database: DatabaseInstance;
}

export const SubnetDatabaseRow = ({ assignedDatabase, database }: Props) => {
  const ipv6Ranges =
    assignedDatabase?.ipv6_ranges
      ?.map((rangeObj) => rangeObj.range)
      .filter((range) => range !== undefined) ?? [];

  const ipv6RangeContent = assignedDatabase?.ipv6_ranges
    ? determineNoneSingleOrMultipleWithChip(ipv6Ranges)
    : '—';

  // For IPv4 addresses column, we display the primary and failover IPs for the database instance.
  const getIPv4AddressesContent = () => {
    const memberKeys = Object.keys(database.members);

    if (memberKeys.length === 0) {
      return '—';
    }
    // If there's only one key in members, it only contains the primary IPv4 which should be returned.
    if (memberKeys.length === 1) {
      return memberKeys[0];
    }

    // Retrieve primary and failover IPv4 addresses since there can be up to 2 failover IPv4 addresses for multi-node HA clusters.
    const primaryIPv4 = memberKeys.find(
      (key) => database.members[key] === 'primary'
    );
    const failoverIPv4s = memberKeys.filter(
      (key) => database.members[key] === 'failover'
    );

    return [primaryIPv4, ...failoverIPv4s].join(', ');
  };

  return (
    <TableRow>
      <TableCell>
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacingFunction(8),
          })}
        >
          {getIsLinkInactive(database.status) ? (
            database?.label
          ) : (
            <Link
              className="secondaryLink"
              to={`/databases/${database?.engine}/${database?.id}/summary`}
            >
              {database?.label}
            </Link>
          )}
          {database.cluster_size > 1 && (
            <Chip
              label="HA"
              size="small"
              sx={(theme) => ({ borderColor: theme.color.green, mx: 0, my: 0 })}
              variant="outlined"
            />
          )}
        </Box>
      </TableCell>
      <TableCell>{getIPv4AddressesContent()}</TableCell>
      <TableCell noWrap>{assignedDatabase?.ipv4_range}</TableCell>
      <TableCell noWrap>{ipv6RangeContent}</TableCell>
    </TableRow>
  );
};

export const SubnetDatabasesTableRowHead = (
  <TableRow>
    <TableCell sx={{ width: '20%' }}>Database Cluster</TableCell>
    <TableCell>IPv4 Address(s)</TableCell>
    <TableCell>VPC IPv4 Range</TableCell>
    <TableCell>VPC IPv6 Range</TableCell>
  </TableRow>
);
