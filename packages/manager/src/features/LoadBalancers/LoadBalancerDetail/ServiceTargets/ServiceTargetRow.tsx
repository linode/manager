import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

import type { ServiceTarget } from '@linode/api-v4';
import { useLoadbalancerCertificateQuery } from 'src/queries/aglb/certificates';

interface Props {
  loadbalancerId: number;
  onDelete: () => void;
  onEdit: () => void;
  serviceTarget: ServiceTarget;
}

export const ServiceTargetRow = (props: Props) => {
  const { onDelete, onEdit, serviceTarget, loadbalancerId } = props;

  const { data: certificate } = useLoadbalancerCertificateQuery(
    loadbalancerId,
    serviceTarget.certificate_id ?? -1,
    serviceTarget.certificate_id !== null
  );

  return (
    <TableRow key={serviceTarget.label}>
      <TableCell>{serviceTarget.label}</TableCell>
      <TableCell>
        <Stack alignItems="center" direction="row" spacing={1}>
          <StatusIcon status="active" />
          <Typography noWrap>4 up</Typography>
          <Typography>&mdash;</Typography>
          <StatusIcon status="error" />
          <Typography noWrap>6 down</Typography>
        </Stack>
      </TableCell>
      <TableCell>{serviceTarget.protocol.toUpperCase()}</TableCell>
      <Hidden smDown>
        <TableCell sx={{ textTransform: 'capitalize' }}>
          {serviceTarget.load_balancing_policy.replace('_', ' ')}
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          {certificate?.label ?? serviceTarget.certificate_id ?? 'None'}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          {serviceTarget.healthcheck.interval !== 0 ? 'Yes' : 'No'}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>{serviceTarget.id}</TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          actionsList={[
            {
              onClick: onEdit,
              title: 'Edit',
            },
            {
              onClick: onDelete,
              title: 'Delete',
            },
          ]}
          ariaLabel={`Action Menu for service target ${serviceTarget.label}`}
        />
      </TableCell>
    </TableRow>
  );
};
