import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { LongviewService } from 'src/features/Longview/request.types';

interface Props {
  service: LongviewService;
}

export const LongviewServiceRow = (props: Props) => {
  const { service } = props;

  return (
    <TableRow data-testid="longview-service-row">
      <TableCell data-qa-service-process>{service.name}</TableCell>
      <TableCell data-qa-service-user>{service.user}</TableCell>
      <TableCell data-qa-service-protocol>{service.type}</TableCell>
      <TableCell data-qa-service-port>{service.port}</TableCell>
      <TableCell data-qa-service-ip>{service.ip}</TableCell>
    </TableRow>
  );
};
