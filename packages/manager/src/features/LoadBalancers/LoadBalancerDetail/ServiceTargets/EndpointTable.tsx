import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import { useLinodesQuery } from 'src/queries/linodes/linodes';

import type { APIError, Endpoint } from '@linode/api-v4';

interface Props {
  endpoints: Endpoint[];
  errors?: APIError[];
  onRemove: (index: number) => void;
}

export const EndpointTable = (props: Props) => {
  const { endpoints, errors, onRemove } = props;

  const { data: linodes } = useLinodesQuery(
    { page_size: 500 },
    {
      '+or': endpoints.map((endpoint) => ({
        ipv4: { '+contains': endpoint.ip },
      })),
    }
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Endpoint</TableCell>
          <TableCell>Host</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {endpoints.length === 0 && (
          <TableRowEmpty colSpan={3} message="No endpoints to display." />
        )}
        {endpoints.map((endpoint, idx) => {
          const fieldErrors = {
            host: errors?.find((e) => e.field === `endpoints[${idx}].host`)
              ?.reason,
            ip: errors?.find((e) => e.field === `endpoints[${idx}].ip`)?.reason,
            port: errors?.find((e) => e.field === `endpoints[${idx}].port`)
              ?.reason,
            rate_capacity: errors?.find(
              (e) => e.field === `endpoints[${idx}].rate_capacity`
            )?.reason,
          };

          const linode = linodes?.data.find((linode) =>
            linode.ipv4.includes(endpoint.ip)
          );

          return (
            <TableRow key={idx}>
              <TableCell>
                {linode?.label ?? endpoint.ip}:{endpoint.port}
                {fieldErrors.ip && (
                  <Typography color={(theme) => theme.palette.error.main}>
                    {fieldErrors.ip}
                  </Typography>
                )}
                {fieldErrors.port && (
                  <Typography color={(theme) => theme.palette.error.main}>
                    {fieldErrors.port}
                  </Typography>
                )}
                {fieldErrors.rate_capacity && (
                  <Typography color={(theme) => theme.palette.error.main}>
                    {fieldErrors.rate_capacity}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {endpoint.host}
                {fieldErrors.host && (
                  <Typography color={(theme) => theme.palette.error.main}>
                    {fieldErrors.host}
                  </Typography>
                )}
              </TableCell>
              <TableCell actionCell>
                <IconButton
                  aria-label={`Remove Endpoint ${endpoint.ip}:${endpoint.port}`}
                  onClick={() => onRemove(idx)}
                >
                  <CloseIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
