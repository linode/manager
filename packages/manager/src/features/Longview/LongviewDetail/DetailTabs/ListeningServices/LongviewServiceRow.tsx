import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { LongviewService } from 'src/features/Longview/request.types';

interface Props {
  service: LongviewService;
}

export const LongviewServiceRow: React.FC<Props> = props => {
  const { service } = props;
  return (
    <TableRow data-testid="longview-service-row">
      <TableCell parentColumn="Process" data-qa-service-process>
        {service.name}
      </TableCell>
      <TableCell parentColumn="User" data-qa-service-user>
        {service.user}
      </TableCell>
      <TableCell parentColumn="Protocol" data-qa-service-protocol>
        {service.type}
      </TableCell>
      <TableCell parentColumn="Port" data-qa-service-port>
        {service.port}
      </TableCell>
      <TableCell parentColumn="IP" data-qa-service-ip>
        {service.ip}
      </TableCell>
    </TableRow>
  );
};

export default LongviewServiceRow;
