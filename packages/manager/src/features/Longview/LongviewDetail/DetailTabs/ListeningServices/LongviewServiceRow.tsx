import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LongviewService } from 'src/features/Longview/request.types';

interface Props {
  service: LongviewService;
}

export const LongviewServiceRow = (props: Props) => {
  const { service } = props;

  return (
    <TableRow ariaLabel={service.name} data-testid="longview-service-row">
      <TableCell data-qa-service-process parentColumn="Process">
        {service.name}
      </TableCell>
      <TableCell data-qa-service-user parentColumn="User">
        {service.user}
      </TableCell>
      <TableCell data-qa-service-protocol parentColumn="Protocol">
        {service.type}
      </TableCell>
      <TableCell data-qa-service-port parentColumn="Port">
        {service.port}
      </TableCell>
      <TableCell data-qa-service-ip parentColumn="IP">
        {service.ip}
      </TableCell>
    </TableRow>
  );
};
